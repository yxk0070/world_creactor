import { JsonRenderer } from "../components/JsonRenderer";
import { StorylineRenderer } from "../components/StorylineRenderer";
import { WorldviewRenderer } from "../components/WorldviewRenderer";
import { CharacterRenderer } from "../components/CharacterRenderer";
import { CharacterNetworkRenderer } from "../components/CharacterNetworkRenderer";
import { ArticleRenderer } from "../components/ArticleRenderer";
import { DialogueRenderer } from "../components/DialogueRenderer";
import { ShortScriptRenderer } from "../components/ShortScriptRenderer";
import { EditableResult } from "../components/EditableResult";
import { useCache } from "../hooks/useCache";

export function CachePage() {
  const {
    categoryNames,
    cacheData,
    stats,
    selectedCategory,
    setSelectedCategory,
    searchKeyword,
    setSearchKeyword,
    selectedItem,
    setSelectedItem,
    isLoading,
    loadCache,
    handleSearch,
    handleDelete,
    handleClearCategory,
    handleClearAll,
    formatDate,
    displayCategories,
  } = useCache();

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 32px",
        minHeight: "calc(100vh - 72px)",
        display: "flex",
        gap: "24px",
      }}
    >
      <div style={{ flex: "0 0 400px" }}>
        <div
          style={{
            background: "rgba(30, 41, 59, 0.85)",
            border: "1px solid rgba(71, 85, 105, 0.5)",
            borderRadius: "20px",
            padding: "24px",
            marginBottom: "20px",
          }}
        >
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "700",
              marginBottom: "20px",
              color: "#f8fafc",
            }}
          >
            📦 历史记录
          </h1>

          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="搜索历史..."
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  border: "2px solid rgba(71, 85, 105, 0.5)",
                  borderRadius: "10px",
                  background: "rgba(15, 23, 42, 0.8)",
                  color: "#f8fafc",
                  fontSize: "14px",
                }}
              />
              <button
                onClick={handleSearch}
                style={{
                  padding: "10px 20px",
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                搜索
              </button>
            </div>
            {searchKeyword && (
              <button
                onClick={() => {
                  setSearchKeyword("");
                  loadCache();
                }}
                style={{
                  width: "100%",
                  padding: "8px 16px",
                  background: "rgba(71, 85, 105, 0.8)",
                  color: "#f8fafc",
                  border: "1px solid rgba(71, 85, 105, 0.5)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                清除搜索
              </button>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#cbd5e1",
                fontWeight: "500",
              }}
            >
              筛选分类
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "2px solid rgba(71, 85, 105, 0.5)",
                borderRadius: "10px",
                background: "rgba(15, 23, 42, 0.8)",
                color: "#f8fafc",
                fontSize: "14px",
              }}
            >
              <option value="all">-- 全部 --</option>
              {Object.entries(categoryNames).map(([key, label]) => (
                <option key={key} value={key}>
                  {label} ({stats[key] || 0})
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={loadCache}
              style={{
                flex: 1,
                padding: "10px 16px",
                background: "rgba(16, 185, 129, 0.2)",
                color: "#10b981",
                border: "1px solid rgba(16, 185, 129, 0.5)",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "13px",
              }}
            >
              🔄 刷新
            </button>
            <button
              onClick={handleClearAll}
              style={{
                flex: 1,
                padding: "10px 16px",
                background: "rgba(239, 68, 68, 0.2)",
                color: "#ef4444",
                border: "1px solid rgba(239, 68, 68, 0.5)",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "13px",
              }}
            >
              🗑️ 清空所有
            </button>
          </div>
        </div>

        <div
          style={{
            background: "rgba(30, 41, 59, 0.85)",
            border: "1px solid rgba(71, 85, 105, 0.5)",
            borderRadius: "20px",
            padding: "24px",
            maxHeight: "calc(100vh - 350px)",
            overflowY: "auto",
          }}
        >
          {isLoading ? (
            <div
              style={{ textAlign: "center", color: "#94a3b8", padding: "40px" }}
            >
              加载中...
            </div>
          ) : (
            displayCategories.map((category) => {
              const items = cacheData[category] || [];
              if (items.length === 0) return null;

              return (
                <div key={category} style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#cbd5e1",
                        margin: 0,
                      }}
                    >
                      {categoryNames[category as keyof typeof categoryNames] ||
                        category}
                    </h3>
                    <button
                      onClick={() => handleClearCategory(category)}
                      style={{
                        padding: "4px 10px",
                        background: "rgba(239, 68, 68, 0.1)",
                        color: "#ef4444",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      清空
                    </button>
                  </div>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      style={{
                        padding: "12px",
                        marginBottom: "8px",
                        background:
                          selectedItem?.id === item.id
                            ? "rgba(99, 102, 241, 0.2)"
                            : "rgba(15, 23, 42, 0.6)",
                        border:
                          selectedItem?.id === item.id
                            ? "1px solid rgba(99, 102, 241, 0.5)"
                            : "1px solid rgba(71, 85, 105, 0.3)",
                        borderRadius: "10px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedItem?.id !== item.id) {
                          e.currentTarget.style.background =
                            "rgba(71, 85, 105, 0.4)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedItem?.id !== item.id) {
                          e.currentTarget.style.background =
                            "rgba(15, 23, 42, 0.6)";
                        }
                      }}
                    >
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#f8fafc",
                          marginBottom: "4px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.name}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#94a3b8",
                        }}
                      >
                        {formatDate(item.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })
          )}

          {!isLoading &&
            displayCategories.every((cat) => !cacheData[cat]?.length) && (
              <div
                style={{
                  textAlign: "center",
                  color: "#94a3b8",
                  padding: "40px",
                }}
              >
                {searchKeyword ? "未找到匹配的历史记录" : "暂无历史记录"}
              </div>
            )}
        </div>
      </div>

      <div style={{ flex: 1 }}>
        {selectedItem ? (
          <div
            style={{
              background: "rgba(30, 41, 59, 0.85)",
              border: "1px solid rgba(71, 85, 105, 0.5)",
              borderRadius: "20px",
              padding: "32px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "24px",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    marginBottom: "8px",
                    color: "#f8fafc",
                  }}
                >
                  {selectedItem.name}
                </h2>
                <div style={{ color: "#94a3b8", fontSize: "14px" }}>
                  创建于: {formatDate(selectedItem.created_at)}
                  {selectedItem.updated_at !== selectedItem.created_at && (
                    <span>
                      {" "}
                      | 更新于: {formatDate(selectedItem.updated_at)}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(selectedItem.id)}
                style={{
                  padding: "10px 20px",
                  background: "rgba(239, 68, 68, 0.2)",
                  color: "#ef4444",
                  border: "1px solid rgba(239, 68, 68, 0.5)",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                🗑️ 删除
              </button>
            </div>

            <EditableResult
              data={selectedItem.data}
              cacheId={selectedItem.id}
              onSave={(newData) => {
                const updatedItem = {
                  ...selectedItem,
                  data: newData,
                  updated_at: new Date().toISOString(),
                };
                setSelectedItem(updatedItem);
                loadCache(); // reload to get the updated item in list
              }}
              defaultTitle={selectedItem.name || "历史记录"}
            >
              <div
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  borderRadius: "12px",
                  padding: "24px",
                  color: "#cbd5e1",
                }}
              >
                {(() => {
                  try {
                    const data = selectedItem.data?.data || selectedItem.data;

                    // 把外部的 id 注入到 data 里，方便里面组件(如 StorylineRenderer)更新缓存
                    if (data && typeof data === "object") {
                      data.cache_id = selectedItem.id;
                    }

                    console.log(
                      "CachePage -> 尝试渲染的原始数据:",
                      selectedItem.data
                    );
                    console.log("CachePage -> 剥离一层的 data:", data);

                    if (
                      data &&
                      (data.key_events || data.title) &&
                      !data.characters &&
                      !data.content // 确保不是文章
                    ) {
                      console.log("CachePage -> 判定为: 故事线");
                      return <StorylineRenderer data={data} />;
                    } else if (data && data.world_name && !data.characters) {
                      console.log("CachePage -> 判定为: 世界观");
                      return <WorldviewRenderer data={selectedItem.data} />;
                    } else if (
                      data &&
                      data.name &&
                      !data.characters &&
                      !data.content
                    ) {
                      console.log("CachePage -> 判定为: 单个人物或关联人物");
                      return <CharacterRenderer data={selectedItem.data} />;
                    } else if (
                      data &&
                      data.characters &&
                      data.network_summary
                    ) {
                      // 人物关系网 (generate_character_network)
                      console.log("CachePage -> 判定为: 人物关系网");
                      return <CharacterNetworkRenderer data={data} />;
                    } else if (data && (data.dialogue || data.data?.dialogue)) {
                      console.log("CachePage -> 判定为: 对话文案");
                      return <DialogueRenderer data={data} />;
                    } else if (data && (data.script || data.data?.script)) {
                      console.log("CachePage -> 判定为: 短句脚本");
                      return <ShortScriptRenderer data={data} />;
                    } else if (
                      data &&
                      (data.content ||
                        data.data?.content ||
                        data.data?.data?.content) &&
                      (data.title ||
                        data.data?.title ||
                        data.data?.data?.title ||
                        data.event_description ||
                        data.data?.event_description)
                    ) {
                      // 事件文章 (generate_article_from_event)
                      console.log("CachePage -> 判定为: 事件文章");
                      return <ArticleRenderer data={data} />;
                    } else {
                      console.log("CachePage -> 判定为: 未知/通用 JSON");
                      return <JsonRenderer data={selectedItem.data} />;
                    }
                  } catch (e) {
                    console.error("CachePage 渲染逻辑报错:", e);
                    return <JsonRenderer data={selectedItem.data} />;
                  }
                })()}
              </div>
            </EditableResult>
          </div>
        ) : (
          <div
            style={{
              background: "rgba(30, 41, 59, 0.85)",
              border: "1px solid rgba(71, 85, 105, 0.5)",
              borderRadius: "20px",
              padding: "80px 32px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>📦</div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "600",
                marginBottom: "12px",
                color: "#cbd5e1",
              }}
            >
              选择一个历史记录项查看详情
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "15px" }}>
              在左侧列表中点击任意历史记录项来查看详细内容
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
