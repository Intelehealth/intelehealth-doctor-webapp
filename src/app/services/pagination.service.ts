import { Injectable } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
  currentPage: number;
  recordsFetched: number;
}

export interface PaginationConfig {
  pageSize: number;
  totalCount: number;
  recordsFetched: number;
}

export interface PaginationResult {
  shouldFetchFromAPI: boolean;
  currentPageData: any[];
  debugInfo?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PaginationService {

  /**
   * Determines if an API call is needed based on pagination state
   * @param config - Pagination configuration
   * @param pageIndex - Current page index
   * @returns boolean indicating if API call is needed
   */
  shouldFetchFromAPI(config: PaginationConfig, pageIndex: number): boolean {
    const requiredRecords = (pageIndex + 1) * config.pageSize;
    const hasMoreDataToFetch = requiredRecords > config.recordsFetched;
    const totalRecordsAvailable = config.recordsFetched >= config.totalCount;
    
    return hasMoreDataToFetch && !totalRecordsAvailable;
  }

  /**
   * Gets the current page data from the provided dataset
   * @param data - Array of data to paginate
   * @param pageIndex - Current page index
   * @param pageSize - Number of items per page
   * @returns Array of items for the current page
   */
  getCurrentPageData<T>(data: T[], pageIndex: number, pageSize: number): T[] {
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }

  /**
   * Updates pagination state from a PageEvent
   * @param event - Angular Material PageEvent
   * @returns Updated pagination state
   */
  updatePaginationState(event: PageEvent): PaginationState {
    return {
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
      currentPage: event.pageIndex + 1,
      recordsFetched: 0 // This should be updated by the component
    };
  }

  /**
   * Creates pagination configuration object
   * @param pageSize - Number of items per page
   * @param totalCount - Total number of items available
   * @param recordsFetched - Number of records currently fetched
   * @returns Pagination configuration
   */
  createPaginationConfig(pageSize: number, totalCount: number, recordsFetched: number): PaginationConfig {
    return {
      pageSize,
      totalCount,
      recordsFetched
    };
  }

  /**
   * Handles pagination logic and returns result with debug information
   * @param data - Array of data to paginate
   * @param config - Pagination configuration
   * @param pageIndex - Current page index
   * @param enableDebug - Whether to include debug information
   * @returns Pagination result with data and API call decision
   */
  handlePagination<T>(
    data: T[], 
    config: PaginationConfig, 
    pageIndex: number, 
    enableDebug: boolean = false
  ): PaginationResult {
    const shouldFetchFromAPI = this.shouldFetchFromAPI(config, pageIndex);
    const currentPageData = this.getCurrentPageData(data, pageIndex, config.pageSize);
    
    const result: PaginationResult = {
      shouldFetchFromAPI,
      currentPageData
    };

    if (enableDebug) {
      const requiredRecords = (pageIndex + 1) * config.pageSize;
      const hasMoreDataToFetch = requiredRecords > config.recordsFetched;
      const totalRecordsAvailable = config.recordsFetched >= config.totalCount;
      
      result.debugInfo = {
        pageIndex,
        pageSize: config.pageSize,
        requiredRecords,
        recordsFetched: config.recordsFetched,
        totalCount: config.totalCount,
        hasMoreDataToFetch,
        totalRecordsAvailable,
        shouldFetch: shouldFetchFromAPI,
        currentPageDataLength: currentPageData.length
      };
    }

    return result;
  }

  /**
   * Resets pagination to first page
   * @returns Reset pagination state
   */
  resetToFirstPage(): PaginationState {
    return {
      pageIndex: 0,
      pageSize: 0, // Should be set by component
      currentPage: 1,
      recordsFetched: 0
    };
  }
}
