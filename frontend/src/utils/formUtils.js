// attendanceUtils.js
// formUtils.js

/**
 * Handles the logic to toggle sorting direction.
 * @param {string} currentSortKey - Current sorted column key
 * @param {string} currentSortDirection - Current direction ('asc' or 'desc')
 * @param {string} newKey - The column key that user clicked to sort
 * @returns {[string, string]} - Updated sortKey and sortDirection
 */
export function updateSort(currentSortKey, currentSortDirection, newKey) {
  if (currentSortKey === newKey) {
    const newDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    return [currentSortKey, newDirection];
  } else {
    return [newKey, 'asc'];
  }
}

/**
 * Sorts a list of records based on a given key and direction.
 * @param {Array} list - Array of objects to sort
 * @param {string} sortKey - Key of object by which to sort
 * @param {string} sortDirection - 'asc' or 'desc'
 * @returns {Array} - Sorted list
 */

export function sortList(list, sortKey, sortDirection) {
  if (!sortKey) return list;
  return [...list].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
}

export function formatCellValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'string' && !isNaN(Date.parse(value))) {
    const date = new Date(value);
    return date.toLocaleString();
  }
  return String(value);
}
export function formatTime12Hour(timeString) {
  // Expect input like "18:07:18"
  const [h, m, s] = timeString.split(":").map(Number);

  if (isNaN(h) || isNaN(m) || isNaN(s)) {
    return "Invalid Time";
  }

  const ampm = h >= 12 ? "PM" : "AM";
  const hours = h % 12 || 12;

  const pad = (num) => num.toString().padStart(2, "0");

  return `${pad(hours)}:${pad(m)}:${pad(s)} ${ampm}`;
}


export function downloadCSV(data, filename, headers) {
  if (!data.length) {
    alert('No data to export');
    return;
  }
  const rows = data.map((item, idx) => [
    idx + 1,
    item.rollNumber,
    item.name,
    item.timestamp,
    item.ipAddress || 'N/A',
    item.optionalField || '__',
  ]);

  const csvContent =
    headers.join(',') +
    '\n' +
    rows
      .map((row) =>
        row
          .map((cell) => {
            const cellStr = String(cell).replace(/"/g, '""');
            return cellStr.includes(',') ? `"${cellStr}"` : cellStr;
          })
          .join(',')
      )
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
