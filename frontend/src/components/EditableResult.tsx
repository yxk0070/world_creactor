import React, { useState } from "react";
import { styles } from "./EditableResult.styles";

interface EditableResultProps {
  data: any;
  cacheId?: string;
  onSave?: (newData: any) => void;
  children: React.ReactNode;
  defaultTitle?: string;
}

export function EditableResult({
  data,
  cacheId,
  onSave,
  children,
  defaultTitle = "导出数据",
}: EditableResultProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => {
    // If the data is wrapped in a response string (like in chat API), parse it so user only edits the real content
    let contentToEdit = data;
    if (data && data.success !== undefined && data.response) {
      try {
        contentToEdit =
          typeof data.response === "string"
            ? JSON.parse(data.response)
            : data.response;
      } catch (e) {
        console.warn("Failed to parse response for editing", e);
        contentToEdit = data.response;
      }
    }

    setEditContent(JSON.stringify(contentToEdit, null, 2));
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      const parsedData = JSON.parse(editContent);

      if (cacheId) {
        const response = await fetch("/api/cache/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: cacheId,
            data: parsedData,
          }),
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || "保存失败");
        }
      }

      if (onSave) {
        if (data && data.success !== undefined && data.response !== undefined) {
          onSave({
            ...data,
            response:
              typeof data.response === "string"
                ? JSON.stringify(parsedData)
                : parsedData,
          });
        } else {
          onSave(parsedData);
        }
      }
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "JSON格式错误或保存失败");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    try {
      let exportData = data;
      if (isEditing) {
        exportData = JSON.parse(editContent);
      } else {
        if (data && data.success !== undefined && data.response) {
          try {
            exportData =
              typeof data.response === "string"
                ? JSON.parse(data.response)
                : data.response;
          } catch (e) {
            exportData = data.response;
          }
        }
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${defaultTitle}_${new Date().getTime()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("导出失败：无效的JSON格式");
    }
  };

  // 检查是否生成失败，如果失败（且带有 error 或不含成功标记的数据），则隐藏操作按钮
  const isFailed =
    data &&
    (data.success === false ||
      (data.status && data.status === "failed") ||
      data.error);

  return (
    <div style={styles.container}>
      {!isFailed && (
        <div style={styles.toolbar}>
          {!isEditing ? (
            <button onClick={handleEdit} style={styles.editBtn}>
              编辑
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={styles.saveBtn}
              >
                {isSaving ? "保存中..." : "保存"}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                style={styles.cancelBtn}
              >
                取消
              </button>
            </>
          )}

          <button onClick={handleExport} style={styles.exportBtn}>
            导出到本地
          </button>
        </div>
      )}

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.content}>
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            style={styles.textarea}
            spellCheck={false}
          />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
