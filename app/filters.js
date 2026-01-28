//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter

// Add your filters here

// Parse JSON string to object/array
addFilter('fromJson', function(str) {
  try {
    return JSON.parse(str)
  } catch (e) {
    return []
  }
})

// Format RPA date string (YYYYMMDD...) to readable date
addFilter('formatRpaDate', function(dateStr) {
  if (!dateStr || dateStr === '—') return '—'

  // Extract YYYYMMDD from the start of the string
  const str = String(dateStr)
  if (str.length < 8) return dateStr

  const year = str.substring(0, 4)
  const month = str.substring(4, 6)
  const day = str.substring(6, 8)

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December']

  const monthIndex = parseInt(month, 10) - 1
  if (monthIndex < 0 || monthIndex > 11) return dateStr

  return `${parseInt(day, 10)} ${months[monthIndex]} ${year}`
})
