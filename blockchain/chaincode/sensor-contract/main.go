package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type SmartContract struct {
	contractapi.Contract
}

type HashRecord struct {
	Hash      string `json:"hash"`
	CreatedAt string `json:"createdAt"`
}

type SensorRecord struct {
	DeviceID  string `json:"deviceId"`
	Hash      string `json:"hash"`
	Timestamp string `json:"timestamp"`
}

type SensorHistoryEntry struct {
	TxID      string        `json:"txId"`
	Timestamp string        `json:"timestamp"`
	IsDelete  bool          `json:"isDelete"`
	Record    *SensorRecord `json:"record,omitempty"`
}

func (s *SmartContract) StoreHash(ctx contractapi.TransactionContextInterface, hash string) error {
	if hash == "" {
		return fmt.Errorf("hash must not be empty")
	}

	key := fmt.Sprintf("hash:%s", hash)
	existing, err := ctx.GetStub().GetState(key)
	if err != nil {
		return fmt.Errorf("failed to read from world state: %w", err)
	}
	if existing != nil {
		return fmt.Errorf("hash already exists")
	}

	record := HashRecord{
		Hash:      hash,
		CreatedAt: time.Now().UTC().Format(time.RFC3339Nano),
	}
	payload, err := json.Marshal(record)
	if err != nil {
		return fmt.Errorf("failed to marshal record: %w", err)
	}

	return ctx.GetStub().PutState(key, payload)
}

func (s *SmartContract) VerifyHash(ctx contractapi.TransactionContextInterface, hash string) (bool, error) {
	if hash == "" {
		return false, fmt.Errorf("hash must not be empty")
	}

	key := fmt.Sprintf("hash:%s", hash)
	data, err := ctx.GetStub().GetState(key)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %w", err)
	}
	return data != nil, nil
}

func (s *SmartContract) StoreSensorData(
	ctx contractapi.TransactionContextInterface,
	deviceID string,
	rawData string,
	timestamp string,
) error {
	if deviceID == "" || rawData == "" || timestamp == "" {
		return fmt.Errorf("invalid input")
	}
	if err := validateTimestamp(timestamp); err != nil {
		return err
	}

	hash := computeHash(rawData)
	key := sensorKey(deviceID, timestamp, hash)
	existing, err := ctx.GetStub().GetState(key)
	if err != nil {
		return fmt.Errorf("failed to read from world state: %w", err)
	}
	if existing != nil {
		return fmt.Errorf("record already exists")
	}

	record := SensorRecord{
		DeviceID:  deviceID,
		Hash:      hash,
		Timestamp: timestamp,
	}
	payload, err := json.Marshal(record)
	if err != nil {
		return fmt.Errorf("failed to marshal record: %w", err)
	}

	return ctx.GetStub().PutState(key, payload)
}

func (s *SmartContract) VerifySensorData(
	ctx contractapi.TransactionContextInterface,
	deviceID string,
	rawData string,
	timestamp string,
) (bool, error) {
	if deviceID == "" || rawData == "" || timestamp == "" {
		return false, fmt.Errorf("invalid input")
	}
	if err := validateTimestamp(timestamp); err != nil {
		return false, err
	}

	hash := computeHash(rawData)
	key := sensorKey(deviceID, timestamp, hash)
	data, err := ctx.GetStub().GetState(key)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %w", err)
	}
	if data == nil {
		return false, nil
	}

	var record SensorRecord
	if err := json.Unmarshal(data, &record); err != nil {
		return false, fmt.Errorf("failed to unmarshal record: %w", err)
	}

	return record.Hash == hash, nil
}

func (s *SmartContract) GetSensorRecord(
	ctx contractapi.TransactionContextInterface,
	deviceID string,
	rawData string,
	timestamp string,
) (*SensorRecord, error) {
	if deviceID == "" || rawData == "" || timestamp == "" {
		return nil, fmt.Errorf("invalid input")
	}
	if err := validateTimestamp(timestamp); err != nil {
		return nil, err
	}

	hash := computeHash(rawData)
	key := sensorKey(deviceID, timestamp, hash)
	data, err := ctx.GetStub().GetState(key)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %w", err)
	}
	if data == nil {
		return nil, fmt.Errorf("record not found")
	}

	var record SensorRecord
	if err := json.Unmarshal(data, &record); err != nil {
		return nil, fmt.Errorf("failed to unmarshal record: %w", err)
	}

	return &record, nil
}

func (s *SmartContract) GetSensorHistory(
	ctx contractapi.TransactionContextInterface,
	deviceID string,
	rawData string,
	timestamp string,
) ([]SensorHistoryEntry, error) {
	if deviceID == "" || rawData == "" || timestamp == "" {
		return nil, fmt.Errorf("invalid input")
	}
	if err := validateTimestamp(timestamp); err != nil {
		return nil, err
	}

	hash := computeHash(rawData)
	key := sensorKey(deviceID, timestamp, hash)
	iterator, err := ctx.GetStub().GetHistoryForKey(key)
	if err != nil {
		return nil, fmt.Errorf("failed to get history: %w", err)
	}
	defer iterator.Close()

	var history []SensorHistoryEntry
	for iterator.HasNext() {
		record, err := iterator.Next()
		if err != nil {
			return nil, fmt.Errorf("failed to read history: %w", err)
		}

		entry := SensorHistoryEntry{
			TxID:     record.TxId,
			IsDelete: record.IsDelete,
		}
		if record.Timestamp != nil {
			entry.Timestamp = time.Unix(record.Timestamp.Seconds, int64(record.Timestamp.Nanos)).UTC().Format(time.RFC3339Nano)
		}
		if len(record.Value) > 0 {
			var sensorRecord SensorRecord
			if err := json.Unmarshal(record.Value, &sensorRecord); err != nil {
				return nil, fmt.Errorf("failed to unmarshal history record: %w", err)
			}
			entry.Record = &sensorRecord
		}

		history = append(history, entry)
	}

	return history, nil
}

func computeHash(rawData string) string {
	sum := sha256.Sum256([]byte(rawData))
	return hex.EncodeToString(sum[:])
}

func validateTimestamp(timestamp string) error {
	if _, err := time.Parse(time.RFC3339Nano, timestamp); err != nil {
		return fmt.Errorf("invalid timestamp format")
	}
	return nil
}

func sensorKey(deviceID string, timestamp string, hash string) string {
	return fmt.Sprintf("sensor:%s:%s:%s", deviceID, timestamp, hash)
}

func main() {
	chaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		panic(fmt.Sprintf("error creating chaincode: %v", err))
	}

	if serverAddress := os.Getenv("CHAINCODE_SERVER_ADDRESS"); serverAddress != "" {
		chaincodeID := os.Getenv("CHAINCODE_ID")
		if chaincodeID == "" {
			panic("CHAINCODE_ID is required when CHAINCODE_SERVER_ADDRESS is set")
		}
		server := &shim.ChaincodeServer{
			CCID:    chaincodeID,
			Address: serverAddress,
			CC:      chaincode,
			TLSProps: shim.TLSProperties{
				Disabled: true,
			},
		}
		if err := server.Start(); err != nil {
			panic(fmt.Sprintf("error starting chaincode server: %v", err))
		}
		return
	}

	if err := chaincode.Start(); err != nil {
		panic(fmt.Sprintf("error starting chaincode: %v", err))
	}

}