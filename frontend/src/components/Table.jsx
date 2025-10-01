function Table({ headers, rows, className = '' }) {
  return (
    <div className={`table-responsive ${className}`}>
      <table className="table table-hover theme-table">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="theme-table-header">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="theme-table-row">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="theme-table-cell">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table