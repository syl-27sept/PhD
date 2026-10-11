function MeetingsPage({
  meetings,
  meetingForm,
  meetingDialogOpen,
  onMeetingDialogToggle,
  onMeetingFormChange,
  onAddMeeting,
  onDeleteMeeting
}) {
  return (
    <section className="page">
      <div className="card">
        <div className="card-head">
          <h2>Supervisor Meetings</h2>
          <button type="button" className="button" onClick={() => onMeetingDialogToggle((current) => !current)}>
            + Add Meeting
          </button>
        </div>

        {meetingDialogOpen && (
          <form className="task-form" onSubmit={onAddMeeting}>
            <input type="text" value={meetingForm.title} onChange={(event) => onMeetingFormChange('title', event.target.value)} placeholder="Meeting title" required />
            <input type="date" value={meetingForm.date} onChange={(event) => onMeetingFormChange('date', event.target.value)} required />
            <textarea value={meetingForm.agenda} onChange={(event) => onMeetingFormChange('agenda', event.target.value)} placeholder="Agenda" rows="3" />
            <div className="dialog-actions">
              <button type="button" className="button secondary" onClick={() => onMeetingDialogToggle(false)}>Cancel</button>
              <button type="submit" className="button">Save meeting</button>
            </div>
          </form>
        )}

        <div className="list">
          {meetings.length ? (
            [...meetings].sort((a, b) => new Date(a.date) - new Date(b.date)).map((meeting) => (
              <div key={meeting.id} className="list-item">
                <strong>{meeting.title}</strong>
                <div className="muted">{meeting.date}</div>
                {meeting.agenda ? <div className="muted">{meeting.agenda}</div> : null}
                <button type="button" className="text-button" onClick={() => onDeleteMeeting(meeting.id)}>Delete</button>
              </div>
            ))
          ) : (
            <div className="empty">No meetings yet.</div>
          )}
        </div>
      </div>
    </section>
  );
}

export default MeetingsPage;
