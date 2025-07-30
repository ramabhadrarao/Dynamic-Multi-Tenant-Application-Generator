import React, { useState, useMemo } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Eye
} from 'lucide-react'

interface Column {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

interface DataTableProps {
  data: any[]
  columns: Column[]
  loading?: boolean
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  onFilter?: (filters: Record<string, any>) => void
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
  onView?: (row: any) => void
  onCreate?: () => void
  onExport?: (format: 'csv' | 'json') => void
  searchable?: boolean
  exportable?: boolean
  selectable?: boolean
  onSelectionChange?: (selectedRows: any[]) => void
  actions?: Array<{
    label: string
    icon?: React.ComponentType<any>
    onClick: (row: any) => void
    variant?: 'primary' | 'secondary' | 'danger'
  }>
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  loading = false,
  pagination,
  onPageChange,
  onLimitChange,
  onSort,
  onFilter,
  onEdit,
  onDelete,
  onView,
  onCreate,
  onExport,
  searchable = true,
  exportable = true,
  selectable = false,
  onSelectionChange,
  actions = []
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [sortColumn, setSortColumn] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedRows, setSelectedRows] = useState<any[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Filter data based on search term and filters
  const filteredData = useMemo(() => {
    let filtered = [...data]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply column filters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        filtered = filtered.filter(row =>
          String(row[key]).toLowerCase().includes(String(filters[key]).toLowerCase())
        )
      }
    })

    return filtered
  }, [data, searchTerm, filters])

  const handleSort = (column: string) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortColumn(column)
    setSortDirection(newDirection)
    onSort?.(column, newDirection)
  }

  const handleFilterChange = (column: string, value: string) => {
    const newFilters = { ...filters, [column]: value }
    setFilters(newFilters)
    onFilter?.(newFilters)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows([...filteredData])
      onSelectionChange?.([...filteredData])
    } else {
      setSelectedRows([])
      onSelectionChange?.([])
    }
  }

  const handleSelectRow = (row: any, checked: boolean) => {
    let newSelection
    if (checked) {
      newSelection = [...selectedRows, row]
    } else {
      newSelection = selectedRows.filter(r => r.id !== row.id)
    }
    setSelectedRows(newSelection)
    onSelectionChange?.(newSelection)
  }

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-4 h-4 text-secondary-400" />
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-primary-600" />
      : <ArrowDown className="w-4 h-4 text-primary-600" />
  }

  const renderPagination = () => {
    if (!pagination) return null

    const { page, totalPages, total } = pagination
    const startItem = (page - 1) * pagination.limit + 1
    const endItem = Math.min(page * pagination.limit, total)

    return (
      <div className="flex items-center justify-between px-6 py-3 border-t border-secondary-200">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-secondary-700">
            Showing {startItem} to {endItem} of {total} results
          </span>
          <select
            value={pagination.limit}
            onChange={(e) => onLimitChange?.(Number(e.target.value))}
            className="input py-1 text-sm"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange?.(page - 1)}
            disabled={page <= 1}
            className="p-2 text-secondary-600 hover:text-secondary-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange?.(pageNum)}
                  className={`px-3 py-1 text-sm rounded ${
                    pageNum === page
                      ? 'bg-primary-600 text-white'
                      : 'text-secondary-600 hover:bg-secondary-100'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => onPageChange?.(page + 1)}
            disabled={page >= totalPages}
            className="p-2 text-secondary-600 hover:text-secondary-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-80"
                />
              </div>
            )}
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary ${showFilters ? 'bg-primary-50 text-primary-700' : ''}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {selectedRows.length > 0 && (
              <span className="text-sm text-secondary-600">
                {selectedRows.length} selected
              </span>
            )}
            
            {exportable && (
              <div className="relative">
                <button className="btn-secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden">
                  <button
                    onClick={() => onExport?.('csv')}
                    className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => onExport?.('json')}
                    className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                  >
                    Export as JSON
                  </button>
                </div>
              </div>
            )}
            
            {onCreate && (
              <button onClick={onCreate} className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add New
              </button>
            )}
          </div>
        </div>

        {/* Filters Row */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {columns.filter(col => col.filterable).map(column => (
              <div key={column.key}>
                <label className="block text-xs font-medium text-secondary-700 mb-1">
                  {column.label}
                </label>
                <input
                  type="text"
                  placeholder={`Filter by ${column.label.toLowerCase()}`}
                  value={filters[column.key] || ''}
                  onChange={(e) => handleFilterChange(column.key, e.target.value)}
                  className="input text-sm"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card-content p-0">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                {selectable && (
                  <th className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                  </th>
                )}
                
                {columns.map(column => (
                  <th key={column.key}>
                    <div className="flex items-center space-x-2">
                      <span>{column.label}</span>
                      {column.sortable && (
                        <button
                          onClick={() => handleSort(column.key)}
                          className="hover:bg-secondary-100 p-1 rounded"
                        >
                          {getSortIcon(column.key)}
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                
                {(onEdit || onDelete || onView || actions.length > 0) && (
                  <th className="w-32">Actions</th>
                )}
              </tr>
            </thead>
            
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0) + 1} className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <p className="mt-2 text-secondary-600">Loading...</p>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0) + 1} className="text-center py-12">
                    <p className="text-secondary-600">No data available</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((row, index) => (
                  <tr key={row.id || index}>
                    {selectable && (
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedRows.some(r => r.id === row.id)}
                          onChange={(e) => handleSelectRow(row, e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                        />
                      </td>
                    )}
                    
                    {columns.map(column => (
                      <td key={column.key}>
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </td>
                    ))}
                    
                    {(onEdit || onDelete || onView || actions.length > 0) && (
                      <td>
                        <div className="flex items-center space-x-2">
                          {onView && (
                            <button
                              onClick={() => onView(row)}
                              className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          
                          {onEdit && (
                            <button
                              onClick={() => onEdit(row)}
                              className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          
                          {onDelete && (
                            <button
                              onClick={() => onDelete(row)}
                              className="p-2 text-secondary-600 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          
                          {actions.map((action, actionIndex) => (
                            <button
                              key={actionIndex}
                              onClick={() => action.onClick(row)}
                              className={`p-2 rounded-lg transition-colors ${
                                action.variant === 'danger'
                                  ? 'text-error-600 hover:text-error-700 hover:bg-error-50'
                                  : action.variant === 'primary'
                                  ? 'text-primary-600 hover:text-primary-700 hover:bg-primary-50'
                                  : 'text-secondary-600 hover:text-secondary-700 hover:bg-secondary-50'
                              }`}
                              title={action.label}
                            >
                              {action.icon ? <action.icon className="w-4 h-4" /> : <MoreHorizontal className="w-4 h-4" />}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  )
}

export default DataTable