# 精绘分层角色 v4

`Avatar.vue` 管理动画时钟、表情和可见性，`RasterRig.vue` 将位图绑定到 `pose.ts` 的共享关节。首页、商城、关卡和结算使用同一个组件。此实现为 SVG 父子关节变换，不是 Spine 网格蒙皮，不支持大幅转身。

## 坐标、部件与遮挡

- `registration.ts` 负责原图尺寸到局部矩形的显式变换、头部眼线、颈点、发型与头饰范围。`RegisteredSprite.vue` 把外部属性显式绑定到 `<image>`；组件还有调试矩形，不能依赖多根节点自动继承 `clip-path`。
- `assets.json` 是版本 4 资源清单。新增图集记录原始画布、切片矩形和裁切偏移。旧资源从原图回溯裁切信息，仅尺寸完全匹配时登记；不匹配的条目明确标记未恢复。
- 动画与渲染共同读取 `JOINTS`；局部肩、肘、颈、髋坐标不再各自维护。武器读取 `attachments.ts` 的握点，绑定到实际上衣对应的前臂；握持手指绘制在武器前。
- 头发与头饰独立；统一头像保持脸型，表情采用登记到同一眼线的局部遮挡层。眨眼使用闭眼素材。头套用蒙版限制头发外露，关羽长须独立前层。
- 披风分为背后主体和前方领口，围巾贴合实际承载上衣。草莓上衣裁掉重复裙摆。长武器和混搭限制关节幅度，完整套装仍使用自身动作。
- 九槽存档和编辑入口保留；`body` 是配饰上衣的承载衣装，常规 `top` 自带袖子。草莓裙子和短裤为独立新素材，其余没有裙装的套装裙槽代表无额外裙层。
- 钢铁侠保持未开放；不修改商品 ID、金币、所有权或购买接口。

## 原画与复现

新图集在 `public/art/rig-v4/source/`，提示词与模型来源见 `art-rig-v4-prompts.json` 和 `source/provenance.json`。执行 `npm run assets:register` 重建新图集切片和资源清单。头像原图带背景，使用明确的轮廓蒙版；不是原生透明分层文件。旧部件图集来源仍在各角色 `source.json`。

## 开发检查台

开发服务器打开 `/scripts/fixtures/rig-lab.html`，支持全部已开放套装、九槽、表情、固定时间、骨骼点和部件边界。查询参数示例：

- `?skin=nezha&time=4.37`：闭眼帧。
- `?skin=lubu&emotion=happy&age=.85&time=1&debug=1`：动作中间帧与锚点。
- `?matrix=goggles`：所有角色佩戴护目镜。
- `?hair=guanyu&top=rabbit&pants=lubu&hand=guanyu&back=ice`：极端混搭。

检查台不作为生产构建入口。

## 验证命令

```sh
npm run lint
npm test
npm run build
TEST_URL=http://localhost:5184 npm run check:responsive
TEST_URL=http://localhost:5184 npm run check:devices
TEST_URL=http://localhost:5184 npm run check:rig-matrix
```

真实后端测试须指向隔离数据库：`RIG_TEST_DATABASE_URL` 用于 `smoke:rig`；`DATABASE_URL` 用于 `smoke:gallery`。数据库必须与测试服务器一致，不要对生产数据库运行种子测试。`WEBKIT=1 npm run check:devices` 需要先安装 Playwright WebKit。

矩阵数值检查只说明图片存在、变换有效，不能替代连接、比例和遮挡的人工验收。发布进度与未验证项见 `QA-V4.md`。
