/**
 * Mnemosyne Memory Panel - DSH Client Component
 * 
 * 对标 dsh-scheduler 的注册模式：
 * - 使用 window.__ModuleLoader__.load 注册
 * - client ID 必须与 cordis.yml 中的 id 匹配（mnemosyne）
 * - 通过 ctx.slots.inject("knj.menu.item") 注册到侧边栏
 * - 导出 apply, inject, name
 */

window.__ModuleLoader__.load({
	id: "mnemosyne",
	factory: (require) => {
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let _deepseek_ai_dsh_client_runtime = require("@deepseek-ai/dsh-client-runtime");
		
		const { useMemo } = react;
		
		// 国际化字典
		const zh = {
			"entry.label": "记忆",
			"panel.title": "Mnemosyne 记忆",
			"panel.subtitle": "长期记忆 · 向量搜索 · 自动反思",
			"stats.total": "总记忆",
			"stats.working": "工作记忆",
			"stats.longTerm": "长期记忆",
			"stats.pages": "知识页面",
			"stats.models": "概念模型",
			"search.placeholder": "搜索记忆...",
			"search.mode": "检索模式",
			"search.mode.guide": "引导",
			"search.mode.routing": "路由",
			"tabs.overview": "概览",
			"tabs.memories": "记忆",
			"tabs.pages": "页面",
			"tabs.models": "模型",
			"tabs.settings": "设置",
			"empty.memories": "暂无记忆，开始对话后自动积累",
			"empty.pages": "暂无知识页面",
			"empty.models": "暂无概念模型",
			"btn.recall": "检索记忆",
			"btn.reflect": "触发反思",
			"btn.seed": "导入 Git 历史",
			"config.recallMode": "检索模式",
			"config.writebackMode": "回写模式",
			"config.idleReviewMs": "空闲反思(ms)",
			"config.recallLimit": "召回数量",
		};
		
		const en = {
			"entry.label": "Memory",
			"panel.title": "Mnemosyne Memory",
			"panel.subtitle": "Long-term Memory · Vector Search · Auto Reflect",
			"stats.total": "Total",
			"stats.working": "Working",
			"stats.longTerm": "Long-term",
			"stats.pages": "Pages",
			"stats.models": "Models",
			"search.placeholder": "Search memories...",
			"search.mode": "Mode",
			"search.mode.guide": "Guided",
			"search.mode.routing": "Routing",
			"tabs.overview": "Overview",
			"tabs.memories": "Memories",
			"tabs.pages": "Pages",
			"tabs.models": "Models",
			"tabs.settings": "Settings",
			"empty.memories": "No memories yet, start chatting to accumulate",
			"empty.pages": "No knowledge pages",
			"empty.models": "No mental models",
			"btn.recall": "Recall",
			"btn.reflect": "Reflect",
			"btn.seed": "Seed Git",
			"config.recallMode": "Recall Mode",
			"config.writebackMode": "Writeback Mode",
			"config.idleReviewMs": "Idle Review (ms)",
			"config.recallLimit": "Recall Limit",
		};
		
		// 获取当前语言
		const lang = typeof window !== 'undefined' && window.__DSH_LOCALE__?.startsWith('zh') ? 'zh' : 'en';
		const dict = lang === 'zh' ? zh : en;
		
		/**
		 * Memory Stats 组件
		 */
		function MemoryStats({ stats }) {
			return react.createElement("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(2, 1fr)",
					gap: "12px",
					padding: "16px"
				}
			},
				createStatCard(dict.stats.total, stats?.total || 0, "🧠"),
				createStatCard(dict.stats.working, stats?.workingCount || 0, "📝"),
				createStatCard(dict.stats.longTerm, stats?.longTermCount || 0, "💾"),
				createStatCard(dict.stats.pages, stats?.pages?.length || 0, "📄"),
				createStatCard(dict.stats.models, stats?.models?.length || 0, "🎯")
			);
		}
		
		function createStatCard(label, value, icon) {
			return react.createElement("div", {
				style: {
					background: "var(--dsw-alias-bg-layer-2, #f5f5f5)",
					borderRadius: "8px",
					padding: "12px",
					textAlign: "center"
				}
			},
				react.createElement("div", {
					style: { fontSize: "24px", marginBottom: "4px" }
				}, icon),
				react.createElement("div", {
					style: { fontSize: "20px", fontWeight: "bold" }
				}, value),
				react.createElement("div", {
					style: { fontSize: "12px", color: "var(--dsw-alias-label-secondary, #666)" }
				}, label)
			);
		}
		
		/**
		 * Memory Search 组件
		 */
		function MemorySearch({ onSearch }) {
			const [query, setQuery] = react.useState("");
			const [mode, setMode] = react.useState("guided");
			
			return react.createElement("div", {
				style: { padding: "16px" }
			},
				react.createElement("input", {
					type: "text",
					placeholder: dict.search.placeholder,
					value: query,
					onChange: (e) => setQuery(e.target.value),
					style: {
						width: "100%",
						padding: "10px 12px",
						border: "1px solid var(--dsw-alias-border, #ddd)",
						borderRadius: "6px",
						fontSize: "14px",
						boxSizing: "border-box"
					}
				}),
				react.createElement("div", {
					style: { display: "flex", gap: "8px", marginTop: "12px" }
				},
					react.createElement("button", {
						onClick: () => onSearch && onSearch(query, mode),
						style: {
							flex: 1,
							padding: "8px 16px",
							background: "var(--dsw-alias-button-primary-fill, #0066ff)",
							color: "white",
							border: "none",
							borderRadius: "6px",
							cursor: "pointer",
							fontSize: "14px"
						}
					}, dict.btn.recall),
					react.createElement("select", {
						value: mode,
						onChange: (e) => setMode(e.target.value),
						style: {
							padding: "8px",
							border: "1px solid var(--dsw-alias-border, #ddd)",
							borderRadius: "6px",
							fontSize: "14px"
						}
					},
						react.createElement("option", { value: "guided" }, dict.search.mode.guide),
						react.createElement("option", { value: "routingGuidance" }, dict.search.mode.routing)
					)
				)
			);
		}
		
		/**
		 * Memory List 组件
		 */
		function MemoryList({ memories }) {
			if (!memories || memories.length === 0) {
				return react.createElement("div", {
					style: { padding: "32px", textAlign: "center", color: "var(--dsw-alias-label-secondary, #999)" }
				}, dict.empty.memories);
			}
			
			return react.createElement("div", {
				style: { padding: "16px" }
			}, memories.map((m, i) => react.createElement("div", {
				key: i,
				style: {
					padding: "12px",
					background: "var(--dsw-alias-bg-layer-2, #f9f9f9)",
					borderRadius: "6px",
					marginBottom: "8px",
					borderLeft: `3px solid ${getMemoryColor(m.event_type)}`
				}
			},
				react.createElement("div", {
					style: { fontSize: "12px", color: "var(--dsw-alias-label-secondary, #666)", marginBottom: "4px" }
				}, m.event_type, " · sim: ", m.similarity?.toFixed(2)),
				react.createElement("div", {
					style: { fontSize: "14px" }
				}, m.content?.slice(0, 200), m.content?.length > 200 ? "..." : "")
			)));
		}
		
		function getMemoryColor(type) {
			const colors = {
				"decision": "#ff6b6b",
				"insight": "#4ecdc4",
				"convention": "#45b7d1",
				"mental_model": "#96ceb4",
				"session_turn": "#aaa"
			};
			return colors[type] || "#888";
		}
		
		/**
		 * Knowledge Pages 组件
		 */
		function KnowledgePages({ pages }) {
			if (!pages || pages.length === 0) {
				return react.createElement("div", {
					style: { padding: "32px", textAlign: "center", color: "var(--dsw-alias-label-secondary, #999)" }
				}, dict.empty.pages);
			}
			
			return react.createElement("div", {
				style: { padding: "16px" }
			}, pages.map((p, i) => react.createElement("div", {
				key: i,
				style: {
					padding: "12px",
					background: "var(--dsw-alias-bg-layer-2, #f9f9f9)",
					borderRadius: "6px",
					marginBottom: "8px"
				}
			},
				react.createElement("div", {
					style: { fontWeight: "bold", marginBottom: "4px" }
				}, p.title),
				react.createElement("div", {
					style: { fontSize: "12px", color: "var(--dsw-alias-label-secondary, #666)" }
				}, p.description)
			)));
		}
		
		/**
		 * Mental Models 组件
		 */
		function MentalModels({ models }) {
			if (!models || models.length === 0) {
				return react.createElement("div", {
					style: { padding: "32px", textAlign: "center", color: "var(--dsw-alias-label-secondary, #999)" }
				}, dict.empty.models);
			}
			
			return react.createElement("div", {
				style: { padding: "16px" }
			}, models.map((m, i) => react.createElement("div", {
				key: i,
				style: {
					padding: "12px",
					background: "var(--dsw-alias-bg-layer-2, #f9f9f9)",
					borderRadius: "6px",
					marginBottom: "8px"
				}
			},
				react.createElement("div", {
					style: { fontWeight: "bold" }
				}, m.title || "概念模型"),
				react.createElement("div", {
					style: { fontSize: "12px", color: "var(--dsw-alias-label-secondary, #666)", marginTop: "4px" }
				}, m.content?.slice(0, 150), m.content?.length > 150 ? "..." : "")
			)));
		}
		
		/**
		 * Main Memory Panel 组件
		 */
		function MemoryPanel() {
			const [activeTab, setActiveTab] = react.useState("overview");
			const [stats, setStats] = react.useState(null);
			const [memories, setMemories] = react.useState([]);
			const [pages, setPages] = react.useState([]);
			const [models, setModels] = react.useState([]);
			
			// 加载数据
			react.useEffect(() => {
				loadStats();
			}, []);
			
			async function loadStats() {
				try {
					const result = await fetch("/api/mnemosyne/stats");
					const data = await result.json();
					setStats(data);
				} catch (e) {
					console.error("[Mnemosyne] Failed to load stats:", e);
				}
			}
			
			async function handleSearch(query, mode) {
				if (!query) return;
				try {
					const result = await fetch(`/api/mnemosyne/recall?q=${encodeURIComponent(query)}&mode=${mode}&k=10`);
					const data = await result.json();
					setMemories(data.memories || []);
					setActiveTab("memories");
				} catch (e) {
					console.error("[Mnemosyne] Search failed:", e);
				}
			}
			
			return react.createElement("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					height: "100%",
					background: "var(--dsh-bg, #fff)"
				}
			},
				// 标题栏
				react.createElement("div", {
					style: {
						padding: "16px",
						borderBottom: "1px solid var(--dsw-alias-border, #eee)",
						background: "var(--dsw-alias-bg-layer-1, #fafafa)"
					}
				},
					react.createElement("div", {
						style: { fontSize: "16px", fontWeight: "bold" }
					}, dict.panel.title),
					react.createElement("div", {
						style: { fontSize: "12px", color: "var(--dsw-alias-label-secondary, #888)", marginTop: "4px" }
					}, dict.panel.subtitle)
				),
				
				// 标签栏
				react.createElement("div", {
					style: {
						display: "flex",
						borderBottom: "1px solid var(--dsw-alias-border, #eee)",
						padding: "0 16px"
					}
				},
					["overview", "memories", "pages", "models", "settings"].map(tab =>
						react.createElement("button", {
							key: tab,
							onClick: () => setActiveTab(tab),
							style: {
								padding: "12px 16px",
								background: "none",
								border: "none",
								borderBottom: activeTab === tab ? "2px solid var(--dsw-alias-button-primary-fill, #0066ff)" : "2px solid transparent",
								cursor: "pointer",
								fontSize: "14px",
								color: activeTab === tab ? "var(--dsw-alias-button-primary-fill, #0066ff)" : "var(--dsw-alias-label-secondary, #666)"
							}
						}, dict["tabs." + tab])
					)
				),
				
				// 内容区
				react.createElement("div", {
					style: { flex: 1, overflow: "auto" }
				},
					activeTab === "overview" && react.createElement(MemoryStats, { stats }),
					activeTab === "memories" && react.createElement(MemorySearch, { onSearch: handleSearch }),
					activeTab === "pages" && react.createElement(KnowledgePages, { pages }),
					activeTab === "models" && react.createElement(MentalModels, { models }),
					activeTab === "settings" && react.createElement(MemorySettings, {})
				)
			);
		}
		
		/**
		 * Settings 组件
		 */
		function MemorySettings() {
			const [config, setConfig] = react.useState({
				recallMode: "guided",
				writebackMode: "guided",
				idleReviewMs: 30000,
				defaultRecallLimit: 10
			});
			
			return react.createElement("div", {
				style: { padding: "16px" }
			},
				createSettingRow(dict.config.recallMode, "select", config.recallMode, ["guided", "routingGuidance"]),
				createSettingRow(dict.config.writebackMode, "select", config.writebackMode, ["guided", "automatic"]),
				createSettingRow(dict.config.idleReviewMs, "number", config.idleReviewMs, null),
				createSettingRow(dict.config.recallLimit, "number", config.defaultRecallLimit, null)
			);
		}
		
		function createSettingRow(label, type, value, options) {
			return react.createElement("div", {
				style: {
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					padding: "12px 0",
					borderBottom: "1px solid var(--dsw-alias-border, #eee)"
				}
			},
				react.createElement("span", null, label),
				options ?
					react.createElement("select", {
						value: value,
						onChange: (e) => console.log("Setting changed:", e.target.value),
						style: { padding: "6px 10px", borderRadius: "4px", border: "1px solid var(--dsw-alias-border, #ddd)" }
					}, options.map(opt => react.createElement("option", { key: opt, value: opt }, opt))),
					type === "number" ?
						react.createElement("input", {
							type: "number",
							value: value,
							onChange: (e) => console.log("Setting changed:", e.target.value),
							style: { width: "100px", padding: "6px 10px", borderRadius: "4px", border: "1px solid var(--dsw-alias-border, #ddd)" }
						}) :
						null
			);
		}
		
		// DSH 插件标准导出
		const name = "dsh-mnemosyne-memory";
		const inject = [
			"locale",
			"slots"
		];

		function apply(ctx) {
			ctx.effect(() => ctx.locale.register("mnemosyne", {
				zh,
				en
			}), "mnemosyne: dictionaries");

			const t = ctx.locale.bind("mnemosyne");

			ctx.effect(() => {
				if (!ctx.slots) return;
				ctx.slots.inject("knj.menu.item", () => ctx.slots.register({
					name: "knj.menu.item",
					id: "mnemosyne",
					order: 30,
					locale: "mnemosyne"
				}, () => react.createElement(MemoryPanel, { t })));
			}, "mnemosyne: sidebar entry");
		}

		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});
