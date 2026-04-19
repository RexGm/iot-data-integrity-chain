package com.iot.bc_api.repository;

import com.iot.bc_api.entity.SensorData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SensorDataRepository extends JpaRepository<SensorData, Long> {

    /**
     * Find sensor data by device ID
     */
    List<SensorData> findByDeviceId(String deviceId);

    /**
     * Find sensor data by hash (ensure data integrity)
     */
    Optional<SensorData> findByHash(String hash);

    /**
     * Check if hash already exists (prevent duplicate data)
     */
    boolean existsByHash(String hash);

    /**
     * Custom query to get latest sensor data by device, ordered by creation date
     */
    @Query(value = "SELECT * FROM sensor_data WHERE device_id = :deviceId ORDER BY created_at DESC LIMIT :limit", 
           nativeQuery = true)
    List<SensorData> findLatestByDeviceId(@Param("deviceId") String deviceId, @Param("limit") int limit);
}
