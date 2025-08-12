# Lucky Lotto Prototype – Changelog

## v4.1 – 2025-08-12
### 新增
- 大廳開獎演出（限定 ZA01-TBL 測試用）：開獎數字球逐一顯示＋輕微晃動動畫
- 中英文切換保持現有色系與佈局

### 修正
- 修正篩選器（全部 / 高頻 / 中頻 / 每日）切換僅能使用一次的 bug
  - 改為直接重新渲染 Lobby，不再依賴 hashchange 事件
- 優化篩選按鈕監聽事件，改用 `e.currentTarget.dataset.f` 取得屬性，避免子元素點擊錯誤

---
