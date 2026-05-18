// src/components/custom/AxiosInterceptorSetup/AxiosInterceptorSetup.jsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '@/shared/services/api';

const AxiosInterceptorSetup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    apiService.setNavigate(navigate);
  }, [navigate]);

  return null;
};

export default AxiosInterceptorSetup;