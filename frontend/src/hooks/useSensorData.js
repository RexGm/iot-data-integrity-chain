import { useState, useEffect, useCallback, useRef } from 'react';
import { sensorApi } from '../api/sensorApi';

export function useSensorData(pollInterval = 5000) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const fetch = useCallback(async () => {
    try {
      const result = await sensorApi.getAll();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    timerRef.current = setInterval(fetch, pollInterval);
    return () => clearInterval(timerRef.current);
  }, [fetch, pollInterval]);

  return { data, loading, error, refetch: fetch };
}

export function useDeviceData(deviceId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deviceId) return;
    setLoading(true);
    sensorApi.getByDevice(deviceId)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [deviceId]);

  return { data, loading };
}

export function useHealthCheck(pollInterval = 10000) {
  const [apiOk, setApiOk] = useState(false);

  useEffect(() => {
    const check = () => sensorApi.health().then(setApiOk).catch(() => setApiOk(false));
    check();
    const t = setInterval(check, pollInterval);
    return () => clearInterval(t);
  }, [pollInterval]);

  return { apiOk };
}

export function useDeviceList(allData) {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    if (!allData?.length) return;
    const unique = [...new Set(allData.map(d => d.deviceId))].sort();
    setDevices(unique);
  }, [allData]);

  return devices;
}

export function useParsedSensorData(allData) {
  return allData.map(item => {
    let parsed = {};
    try {
      parsed = JSON.parse(item.rawData);
    } catch { /* ignore */ }
    return { ...item, parsed };
  });
}
