# AI 素材 Prompt 包

> 日期：2026-04-16  
> 用途：给 `S6-clean` AI 生成路线提供可复用的干净输入。  
> 边界：这些 prompt 只能生成候选草稿；输出不自动批准入库。

## 0. 通用负面约束

每次生成都要带上这些约束，或者在工具的 negative prompt / style constraint 里表达：

```text
no logos, no readable text, no existing game UI, no official game assets, no copyrighted characters, no franchise references, no Warcraft, no Blizzard, no fan remake, no realistic gore, no watermark, no signature
```

中文执行口径：

- 不写 `War3`、`Warcraft`、`Blizzard`、`Alliance`、`Arthas`、`Jaina`、`Stormwind` 等词。
- 不上传官方截图、官方图标、fan art、网盘素材、未知来源参考图。
- 不要求“某游戏风格”“某画师风格”“复刻某单位”。
- 输出只能进候选台账，不能直接进 `public/assets`。

## 1. 3D 单位 prompt

### 1.1 Rifleman / 远程火枪兵

```text
low poly original medieval human rifleman unit for a top-down RTS game, chunky readable silhouette, long firearm barrel clearly visible from above, leather cap, simple shoulder armor, blue team-color cloth strip, standing idle pose, stylized proportions, clean geometry, game-ready 3D model, no logos, no text
```

可读性目标：

- 枪管要比身体更醒目。
- 和 footman 并排时不能像剑盾兵。
- 默认镜头下颜色和轮廓比细节更重要。

### 1.2 Footman / 剑盾步兵

```text
low poly original medieval human foot soldier for a top-down RTS game, broad stance, large shield and short sword, chunky helmet, simple metal armor, blue team-color sash, readable from distance, stylized game-ready 3D model, clean materials, no logos, no text
```

可读性目标：

- 盾牌是第一识别点。
- 比 worker 更宽、更硬。
- 不要复杂纹章，避免阵营徽章联想。

### 1.3 Sorceress / 法师单位

```text
low poly original human frost mage unit for a top-down RTS game, slender readable silhouette, short staff, blue-white cloth accents, small magical glow at hand, calm idle pose, stylized fantasy village army, clean geometry, game-ready 3D model, no logos, no text
```

可读性目标：

- 读成 caster，不读成普通弓手或步兵。
- 魔法亮点必须小而清楚，不能遮模型。
- 和 Priest 需要后续用颜色 / 法杖 / 头饰区分。

### 1.4 Knight / 骑士

```text
low poly original medieval mounted knight unit for a top-down RTS game, armored rider on compact horse, lance or sword readable from above, strong cavalry silhouette, blue team-color cloth on horse, stylized proportions, clean geometry, game-ready 3D model, no logos, no text
```

可读性目标：

- 体量要明显大于 footman。
- 马的轮廓要清楚，但不要过高面数。
- 选择圈和 footprint 不能被模型比例欺骗。

### 1.5 Worker / 工人

```text
low poly original medieval worker unit for a top-down RTS game, small human villager with pickaxe and tool belt, readable tool silhouette, simple tunic, blue team-color shoulder cloth, friendly but functional, clean game-ready 3D model, no logos, no text
```

可读性目标：

- 工具是第一识别点。
- 不能像战斗单位。
- 采集 / 建造状态后续必须保留工具轮廓。

## 2. 3D 建筑 prompt

### 2.1 Blacksmith / 铁匠铺

```text
low poly original medieval blacksmith building for a top-down RTS game, wide low workshop shape, large chimney, visible forge glow, anvil outside, weapon rack silhouette, blue team-color banner, readable from distance, clean game-ready 3D asset, no logos, no text
```

可读性目标：

- 烟囱、炉火、铁砧三者至少保留两个。
- 不要像普通民房。
- 入口朝向和建筑 footprint 要稳定。

### 2.2 Barracks / 兵营

```text
low poly original medieval barracks building for a top-down RTS game, long training hall, open front gate, shield and spear racks as simple shapes, blue team-color flag, strong military production silhouette, readable from distance, clean game-ready 3D asset, no logos, no text
```

可读性目标：

- 必须像生产建筑，不像主基地。
- 门洞 / 出兵方向要清楚。
- 盾矛装饰只能是通用形状，不做特定徽章。

### 2.3 Farm / 农场

```text
low poly original medieval farm building for a top-down RTS game, small low cottage and hay storage, simple fenced footprint, warm roof, blue team-color small cloth marker, repeatable wall-piece silhouette, clean game-ready 3D asset, no logos, no text
```

可读性目标：

- 小而低，可重复摆放。
- 不能像 barracks 或 town hall。
- 成排时边界要清楚，不糊成地形。

### 2.4 Tower / 防御塔

```text
low poly original medieval watch tower for a top-down RTS game, tall narrow wooden and stone structure, clear top platform, small ballista or lookout shape, blue team-color flag, strong vertical silhouette, readable attack source, clean game-ready 3D asset, no logos, no text
```

可读性目标：

- 高度和危险感第一眼成立。
- 顶部攻击点要明显。
- 不要复杂装饰抢 HUD。

### 2.5 Keep / Castle / 主基地升级

```text
low poly original medieval human town keep building for a top-down RTS game, large central hall, stronger stone base, taller roof and watch posts, main entrance clearly visible, blue team-color banners, readable as upgraded base anchor, clean game-ready 3D asset, no logos, no text
```

可读性目标：

- 必须比 Town Hall 更强，但仍是同一建筑线。
- 不要做成完整城堡景观，优先服务基地 anchor。
- 和 Barracks / Farm 体量差要明显。

### 2.6 Workshop / 工程车间

```text
low poly original medieval mechanical workshop for a top-down RTS game, sturdy workshop with gears, small crane, wooden wheels, smoke stack, blue team-color cloth, readable mechanical production silhouette, clean game-ready 3D asset, no logos, no text
```

可读性目标：

- 读成机械生产，不读成铁匠铺。
- 齿轮 / 吊臂 / 车轮至少保留两个。
- 细节要大块化。

### 2.7 Arcane Sanctum / 魔法建筑

```text
low poly original medieval arcane study building for a top-down RTS game, compact tower-library shape, blue crystal focus, simple arch doorway, soft magical glow, blue team-color banner, readable caster production building, clean game-ready 3D asset, no logos, no text
```

可读性目标：

- 读成法师生产建筑，不读成 tower。
- 魔法水晶是识别点，但不要过亮。
- 和普通建筑保持同一低模语言。

## 3. 资源和地形 prompt

### 3.1 Goldmine / 金矿

```text
low poly original gold mine resource node for a top-down RTS game, dark rock mound with clear cave entrance, visible gold ore chunks, readable worker gathering target, compact footprint, clean game-ready 3D asset, no logos, no text
```

### 3.2 Tree Line / 树线

```text
low poly stylized forest edge modules for a top-down RTS game, clustered conifer and broadleaf trees, continuous readable tree-line boundary, clear harvestable front edge, not too tall, clean game-ready 3D asset, no logos, no text
```

### 3.3 Path / 路径辅助

```text
low poly top-down RTS terrain readability decals, dirt path patches, worn road edge, subtle ground contrast, readable route from base to gold mine and forest, seamless modular pieces, no logos, no text
```

## 4. 图标 prompt

图标如果用 AI 生成，建议先出黑白或双色大形，再人工重画。

### 4.1 Long Rifles

```text
simple fantasy RTS command icon, long rifle silhouette with range arc, bold readable shape, dark background, blue accent, no text, no logo, no franchise reference
```

### 4.2 Defend

```text
simple fantasy RTS command icon, shield raised in front of soldier silhouette, bold readable shape, dark background, blue accent, no text, no logo, no franchise reference
```

### 4.3 Slow

```text
simple fantasy RTS spell icon, icy hand and slowed boot silhouette, bold readable shape, dark background, blue-white accent, no text, no logo, no franchise reference
```

### 4.4 Call to Arms

```text
simple fantasy RTS command icon, village bell and crossed tools transforming into weapons, bold readable shape, dark background, blue accent, no text, no logo, no franchise reference
```

### 4.5 Blacksmith Upgrade

```text
simple fantasy RTS research icon, hammer striking anvil with small spark, bold readable shape, dark background, steel and blue accent, no text, no logo, no franchise reference
```

## 5. 每次生成后的记录模板

```yaml
candidate_id:
tool:
account_plan:
terms_url:
terms_checked_at:
prompt:
negative_prompt:
input_sources: text-only
output_files:
human_modification:
target_runtime_key:
fallback_id:
status: reference-only
owner_decision:
```

## 6. 当前批准结论

```text
这些 prompt 可以用于生成候选草稿。
任何输出默认 status = reference-only。
只有补齐工具条款、prompt 日志、人工修改、默认镜头预览和 fallback 后，才可能进入 approved-for-intake。
```
