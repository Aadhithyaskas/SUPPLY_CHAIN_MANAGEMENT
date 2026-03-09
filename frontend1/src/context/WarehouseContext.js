import React, { createContext, useState, useContext } from 'react';
import * as warehouseService from '../services/warehouseService';

const WarehouseContext = createContext();

export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
};

export const WarehouseProvider = ({ children }) => {
  const [warehouse, setWarehouse] = useState(null);
  const [warehouseExists, setWarehouseExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createWarehouse = async (data) => {
    setLoading(true);
    setError('');
    try {
      const response = await warehouseService.createWarehouse(data);
      setWarehouse(response.warehouse);
      setWarehouseExists(true);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateWarehouse = async (data) => {
    setLoading(true);
    setError('');
    try {
      const response = await warehouseService.updateWarehouse(data);
      setWarehouse(prev => ({ ...prev, ...data }));
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouse = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await warehouseService.getWarehouse();
      setWarehouse(data);
      setWarehouseExists(!!data);
      return data;
    } catch (error) {
      setError(error.message);
      setWarehouseExists(false);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    warehouse,
    warehouseExists,
    loading,
    error,
    createWarehouse,
    updateWarehouse,
    fetchWarehouse
  };

  return (
    <WarehouseContext.Provider value={value}>
      {children}
    </WarehouseContext.Provider>
  );
};