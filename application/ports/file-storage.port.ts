/**
 * File Storage Port
 * 
 * Interface for file/image storage services
 */

export interface UploadResult {
  url: string
  path: string
  size: number
  contentType: string
}

export interface FileStoragePort {
  /**
   * Upload a file from a URL
   */
  uploadFromUrl(url: string, path: string): Promise<UploadResult>
  
  /**
   * Upload a file from base64 data
   */
  uploadFromBase64(base64: string, path: string, contentType: string): Promise<UploadResult>
  
  /**
   * Upload a file buffer
   */
  uploadBuffer(buffer: Buffer, path: string, contentType: string): Promise<UploadResult>
  
  /**
   * Delete a file
   */
  delete(path: string): Promise<void>
  
  /**
   * Get a signed URL for temporary access
   */
  getSignedUrl(path: string, expiresIn?: number): Promise<string>
}
