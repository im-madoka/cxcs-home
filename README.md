# CXCS Website

东南大学成贤学院计算机协会官方网站，主站为 `cxcs.dev`。

## 本地运行

```bash
bun install
bun run dev
```

生产构建：

```bash
bun run build
```

设计基线见 [`docs/design.md`](./docs/design.md)，实施顺序见 [`docs/plan.md`](./docs/plan.md)。

## 内容

Articles、Activities、Projects 和 Theater 使用 Astro Content Collections，内容与图片尽量 colocate 在 `src/content/`。协会真实名称、联系方式、组织架构、招新入口和角色版权资料确认后再补入 Production。

## 检查

```bash
bun run check
bun test
bun run lint
bun run format:check
```
