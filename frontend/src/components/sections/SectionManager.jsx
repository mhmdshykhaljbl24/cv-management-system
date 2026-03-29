import styles from "./SectionManager.module.css";

export default function SectionManager({
  title,
  items,
  onAdd,
  onDelete,
  onEdit,
  renderItem,
}) {
  const safeRender =
    typeof renderItem === "function"
      ? renderItem
      : (item) => <pre>{JSON.stringify(item, null, 2)}</pre>;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>{title}</h3>

        <button className={styles.addBtn} onClick={onAdd}>
          + Add
        </button>
      </div>

      {items.length === 0 ? (
        <div className={styles.empty}>No items yet.</div>
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <div key={item.id} className={styles.item}>
              <div className={styles.content}>{safeRender(item)}</div>

              <div className={styles.actions}>
                {/* Edit */}
                <button
                  className={styles.editBtn}
                  onClick={() => onEdit?.(item)}
                  type="button"
                >
                  Edit
                </button>

                {/* Delete */}
                <button
                  className={styles.deleteBtn}
                  onClick={() => onDelete(item.id)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
