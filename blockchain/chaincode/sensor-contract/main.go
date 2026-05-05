package main

import (
	"encoding/json"
	"fmt"
	"time"

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

func (s *SmartContract) StoreSensorHash(
	ctx contractapi.TransactionContextInterface,
	deviceID string,
	hash string,
	timestamp string,
) error {
	if deviceID == "" || hash == "" || timestamp == "" {
		return fmt.Errorf("invalid input")
	}

	key := fmt.Sprintf("sensor:%s:%s", deviceID, timestamp)
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
	hash string,
	timestamp string,
) (bool, error) {
	if deviceID == "" || hash == "" || timestamp == "" {
		return false, fmt.Errorf("invalid input")
	}

	key := fmt.Sprintf("sensor:%s:%s", deviceID, timestamp)
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

func main() {
	chaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		panic(fmt.Sprintf("error creating chaincode: %v", err))
	}

	if err := chaincode.Start(); err != nil {
		panic(fmt.Sprintf("error starting chaincode: %v", err))
	}
}
