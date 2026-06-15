export default function ConfirmModal({
  title = 'Are you sure?',
  message = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmClassName = 'btn danger',
  onCancel,
  onConfirm,
}) {
  return (
    <div className="modalOverlay" onClick={onCancel}>
      <div className="modalCard" onClick={(e) => e.stopPropagation()}>
        <div className="modalTitle">{title}</div>

        {message ? <div className="modalText">{message}</div> : null}

        <div className="modalActions">
          <button type="button" className="btn ghost" onClick={onCancel}>
            {cancelText}
          </button>

          <button type="button" className={confirmClassName} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
