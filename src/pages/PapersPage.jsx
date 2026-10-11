function PapersPage({
  paperSearch,
  paperStatus,
  paperStream,
  filteredPapers,
  allStreamOptions,
  onSearch,
  onStatusChange,
  onStreamChange
}) {
  return (
    <section className="page">
      <div className="section-tools">
        <input
          type="search"
          value={paperSearch}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search papers..."
          aria-label="Search papers"
        />
        <select value={paperStatus} onChange={(event) => onStatusChange(event.target.value)} aria-label="Filter papers by status">
          <option value="">All statuses</option>
          <option value="Unread">Unread</option>
          <option value="Reading">Reading</option>
          <option value="Read">Read</option>
        </select>
        <select value={paperStream} onChange={(event) => onStreamChange(event.target.value)} aria-label="Filter by literature stream">
          <option value="">All literature streams</option>
          {allStreamOptions.map((stream) => (
            <option key={stream} value={stream}>{stream}</option>
          ))}
        </select>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Papers</h2>
          
<a
  href="https://docs.google.com/spreadsheets/d/107Ej9K3Ztxl6EWqd7k8WtdaXhmXNRnT0tmeBni4V5iM/edit"
  target="_blank"
  rel="noreferrer"
>
  Open Google Sheet ↗
</a>

        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Author(s)</th>
                <th>Year</th>
                <th>Title</th>
                <th>Journal/Book</th>
                <th>Literature stream</th>
                <th>Read?</th>
              </tr>
            </thead>
            <tbody>
              {filteredPapers.length ? (
                filteredPapers.map((paper, index) => (
                  <tr key={`${paper.title}-${index}`}>
                    <td>{paper.author}</td>
                    <td>{paper.year}</td>
                    <td>
                      {paper.link && paper.link !== '#' ? (
                        <a href={paper.link} target="_blank" rel="noreferrer">{paper.title}</a>
                      ) : (
                        paper.title
                      )}
                    </td>
                    <td>{paper.journal}</td>
                    <td>{paper.stream}</td>
                    <td>{paper.read}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty">No papers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default PapersPage;
