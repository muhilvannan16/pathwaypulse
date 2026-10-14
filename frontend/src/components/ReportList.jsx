import ReportCard from './ReportCard.jsx'

export default function ReportList({ reports, selectedId, isSample, onSelect }) {
  return (
    <ul className="report-list">
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          selected={report.id === selectedId}
          isSample={isSample}
          onSelect={onSelect}
        />
      ))}
    </ul>
  )
}
