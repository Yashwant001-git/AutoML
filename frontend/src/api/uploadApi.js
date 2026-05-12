const BASE_URL = '/api/v1'

/**
 * Upload a CSV file to the backend.
 * Returns the full UploadResponse JSON on success.
 * Throws an Error with a human-readable message on failure.
 */
export async function uploadDataset(file) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${BASE_URL}/upload/`, {
    method: 'POST',
    body: formData,
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.detail || `Upload failed (${res.status})`)
  }

  return data
}

/**
 * Fetch preview rows for an already-uploaded dataset.
 * n — number of rows (default 8, max 100)
 */
export async function getPreview(datasetId, n = 8) {
  const res = await fetch(`${BASE_URL}/upload/${datasetId}/preview?n=${n}`)
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.detail || `Preview fetch failed (${res.status})`)
  }

  return data
}

/**
 * Delete a dataset from the server's in-memory store.
 */
export async function deleteDataset(datasetId) {
  const res = await fetch(`${BASE_URL}/upload/${datasetId}`, {
    method: 'DELETE',
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.detail || `Delete failed (${res.status})`)
  }

  return true
} 
