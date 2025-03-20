import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ApiService from './ApiService';
import CorsError from './errors/CorsError';
import CorsErrorPopupContentObject from '../models/popup-content-object/CorsErrorPopupContentObject';

describe('ApiService CORS error handling', () => {
  let errorSubscriberMock;
  let originalErrorSubscribers;

  beforeEach(() => {
    errorSubscriberMock = vi.fn();
    originalErrorSubscribers = [...ApiService.errorSubscribers];
    ApiService.errorSubscribers = [];
    ApiService.onError(errorSubscriberMock);
    
    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    };
  });

  afterEach(() => {
    ApiService.errorSubscribers = originalErrorSubscribers;
    vi.restoreAllMocks();
  });

  describe('isCorsError', () => {
    it('should identify CORS error from error message containing "cors"', () => {
      const error = new TypeError('Failed to fetch due to CORS policy');
      expect(ApiService.isCorsError(error)).toBe(true);
    });

    it('should identify CORS error from error message containing "cross-origin"', () => {
      const error = new TypeError('Cross-Origin Request Blocked');
      expect(ApiService.isCorsError(error)).toBe(true);
    });

    it('should identify CORS error from error message containing "access-control-allow-origin"', () => {
      const error = new TypeError('No Access-Control-Allow-Origin header is present');
      expect(ApiService.isCorsError(error)).toBe(true);
    });

    it('should identify CORS error from TypeError with network error', () => {
      const error = new TypeError('Failed to fetch');
      expect(ApiService.isCorsError(error)).toBe(true);
    });

    it('should not identify non-CORS errors', () => {
      const error = new Error('Regular error');
      expect(ApiService.isCorsError(error)).toBe(false);
    });
  });

  describe('getFetchErrorMessageOtherThanBadRequest', () => {
    it('should throw CorsError for CORS errors', () => {
      const error = new TypeError('Cross-Origin Request Blocked');
      const url = 'http://localhost:8000/api/v0.1.1/auth/token/';
      
      expect(() => {
        ApiService.getFetchErrorMessageOtherThanBadRequest(error, url);
      }).toThrow(CorsError);
    });

    it('should return error message for other errors', () => {
      const error = new Error('Regular error');
      const result = ApiService.getFetchErrorMessageOtherThanBadRequest(error, 'http://example.com');
      expect(result).toBe('Regular error');
    });
  });

  describe('login method CORS error handling', () => {
    it('should notify error subscribers on CORS error', async () => {
      // Mock fetch to simulate CORS error
      global.fetch = vi.fn().mockImplementation(() => {
        throw new TypeError('Cross-Origin Request Blocked');
      });

      try {
        await ApiService.login();
      } catch (error) {
        // We expect login to throw, but we want to verify the error subscriber was called
      }

      // Verify error subscriber was called with a CorsError
      expect(errorSubscriberMock).toHaveBeenCalled();
      expect(errorSubscriberMock.mock.calls[0][0]).toBeInstanceOf(CorsError);
    });
  });

  describe('fetchData method CORS error handling', () => {
    it('should handle XMLHttpRequest CORS errors (status 0)', async () => {
      // Mock XMLHttpRequest
      const mockXHR = {
        open: vi.fn(),
        send: vi.fn(),
        setRequestHeader: vi.fn(),
        status: 0,
        onload: null,
        onerror: null,
        upload: { onprogress: null },
      };
      
      global.XMLHttpRequest = vi.fn(() => mockXHR);
      
      // Mock getHeaders to avoid actual token handling
      ApiService.getHeaders = vi.fn().mockResolvedValue({});
      
      const fetchPromise = ApiService.fetchData('test-endpoint', 'GET');
      
      // Trigger onerror to simulate CORS error
      mockXHR.onerror();
      
      try {
        await fetchPromise;
      } catch (error) {
        // Expected to throw
      }
      
      // Verify error subscriber was called with a CorsError
      expect(errorSubscriberMock).toHaveBeenCalled();
      expect(errorSubscriberMock.mock.calls[0][0]).toBeInstanceOf(CorsError);
    });
  });

  describe('CorsError and popup content integration', () => {
    it('should create appropriate CorsErrorPopupContentObject from CorsError', () => {
      const corsErrorObj = {
        message: 'Cross-Origin Request Blocked',
        url: 'http://localhost:8000/api/v0.1.1/auth/token/',
      };
      
      const corsError = new CorsError(corsErrorObj);
      const popupContent = new CorsErrorPopupContentObject(corsError.requestErrors[0]);
      
      expect(popupContent.title).toBe('Cross-Origin Request Error');
      expect(popupContent.type).toBe('CorsErrorPopupContentObject');
      expect(popupContent.operationErrors.length).toBeGreaterThan(0);
      
      // Verify first error is the main message
      expect(popupContent.operationErrors[0].name).toBe('Error');
      expect(popupContent.operationErrors[0].errors[0]).toBe('Cross-Origin Request Blocked');
      
      // Verify details section contains the URL
      expect(popupContent.operationErrors[1].name).toBe('Details');
      expect(popupContent.operationErrors[1].errors[1]).toContain('http://localhost:8000/api/v0.1.1/auth/token/');
    });
  });
});