import { useState, useEffect } from "react";

interface CacheItem {
  id: string;
  name: string;
  created_at: string;
  updated_at?: string;
  data?: any;
}

interface CacheData {
  [key: string]: CacheItem[];
}

interface Stats {
  [key: string]: number;
}

const categoryNames = {
  worldview: "🌍 世界观",
  worldview_analysis: "🔍 世界观分析",
  character: "👤 人物",
  related_character: "🔗 关联人物",
  generate_character_network: "🕸️ 人物关系网",
  story: "📜 核心故事线",
  timeline: "📊 时间线",
  generate_article_from_event: "✍️ 事件文章",
};

export function useCache() {
  const [cacheData, setCacheData] = useState<CacheData>({});
  const [stats, setStats] = useState<Stats>({});
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedItem, setSelectedItem] = useState<CacheItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCache();
  }, []);

  const loadCache = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/cache/all");
      const data = await response.json();
      if (data.success) {
        // 确保数据按 created_at 降序排列
        const sortedData: CacheData = {};
        for (const [key, items] of Object.entries(data.data as CacheData)) {
          sortedData[key] = [...items].sort((a, b) => {
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          });
        }
        setCacheData(sortedData);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("加载缓存失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword) {
      loadCache();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/cache/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: searchKeyword }),
      });
      const data = await response.json();
      if (data.success) {
        const searchResults: CacheData = {};
        data.data.forEach((item: CacheItem) => {
          const category =
            Object.keys(categoryNames).find((cat) =>
              cacheData[cat]?.some((c) => c.id === item.id),
            ) || "search";
          if (!searchResults[category]) {
            searchResults[category] = [];
          }
          searchResults[category].push(item);
        });
        setCacheData(searchResults);
      }
    } catch (error) {
      console.error("搜索缓存失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm("确定要删除这个历史记录项吗？")) return;

    try {
      const response = await fetch("/api/cache/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId }),
      });
      const data = await response.json();
      if (data.success) {
        setSelectedItem(null);
        loadCache();
      }
    } catch (error) {
      console.error("删除历史记录失败:", error);
    }
  };

  const handleClearCategory = async (category: string) => {
    if (
      !window.confirm(
        `确定要清空 ${
          categoryNames[category as keyof typeof categoryNames] || category
        } 分类的所有历史记录吗？`,
      )
    )
      return;

    try {
      const response = await fetch("/api/cache/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      const data = await response.json();
      if (data.success) {
        setSelectedItem(null);
        loadCache();
      }
    } catch (error) {
      console.error("清空历史记录失败:", error);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("确定要清空所有历史记录吗？此操作不可恢复！")) return;

    try {
      const response = await fetch("/api/cache/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (data.success) {
        setSelectedItem(null);
        loadCache();
      }
    } catch (error) {
      console.error("清空所有历史记录失败:", error);
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleString("zh-CN");
  };

  const displayCategories =
    selectedCategory === "all"
      ? Object.keys(categoryNames)
      : [selectedCategory];

  return {
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
  };
}
