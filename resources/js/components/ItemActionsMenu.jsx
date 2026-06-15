import React from 'react'

export default function ItemActionsMenu({
  busy,
  className = '',
  isOpen,
  menuClassName = '',
  label,
  onToggle,
  onEdit,
  onDelete,
}) {
  const containerClassName = ['itemMenu', className].filter(Boolean).join(' ')
  const dropdownClassName = ['menuDropdown', menuClassName].filter(Boolean).join(' ')

  return (
    <div className={containerClassName} onClick={(event) => event.stopPropagation()}>
      <button
        className="menuTrigger"
        type="button"
        disabled={busy}
        onClick={onToggle}
        aria-label={label}
      >
        ⋮
      </button>

      {isOpen ? (
        <div className={dropdownClassName}>
          <button type="button" className="menuItem" disabled={busy} onClick={onEdit}>
            Edit
          </button>

          <button type="button" className="menuItem danger" disabled={busy} onClick={onDelete}>
            Delete
          </button>
        </div>
      ) : null}
    </div>
  )
}
