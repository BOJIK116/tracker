export default function ConfirmModal({ onCancel, onConfirm, count = 0 }) {
  return (
    <div className="modalOverlay" onClick={onCancel}>
      <div className="modalCard" onClick={(e) => e.stopPropagation()}>
        <div className="modalTitle">
          Delete {count > 0 ? count : ''} {count === 1 ? 'direction' : 'directions'}?
        </div>

        <div className="modalText">
          All related marks will also be permanently deleted.
        </div>

        <div className="modalActions">
          <button type="button" className="btn ghost" onClick={onCancel}>
            Cancel
          </button>

          <button type="button" className="btn danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}