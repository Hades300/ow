## 英雄表现看板


这是一个守望先锋英雄表现看板系统，用来观察一段时间内英雄的多个指标的变化，如胜率，KDA，胜率，选择率等等。
结合官方更新、补丁，分析多个他们对英雄的英雄。


### 数据源

只能从官方获取，目前官网会展示最近一天的所有英雄数据，每天十点更新。
实际这个时间不一定准确，但可以确定是按天维度来更新。并且只有那一天的数据。

因此我们要定时采集这些数据.
```
curl 'https://webapi.blizzard.cn/ow-armory-server/hero_leaderboard?game_mode=jingji&season=15&mmr=-127' \
  -H 'accept: application/json, text/javascript, */*; q=0.01' \
  -H 'accept-language: zh-CN,zh;q=0.9' \
  -H 'origin: https://ow.blizzard.cn' \
  -H 'priority: u=1, i' \
  -H 'referer: https://ow.blizzard.cn/' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: same-site' \
  -H 'user-agent: Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
```

样例数据放在`guide\learderboard.json`中。


### UI展示

拥有完整的数据之后，我们要提供一个UI来展示这些数据，设计师已经给出了原型，放在`guide/design.html`中，这里是一个可交互的原型。

但要注意一点，我们的数据是不完整的：只有从某一天开始的数据
因此提供给用户的时间范围是有限的，需要做好这部分的用户提示、交互。

### 组合在一起

此处涉及数据的拉取、存储、组合展示。
你需要根据涉及文档，分析出我们需要提供几个接口、接口设计。
整个后端尽可能无需vps，如考虑使用cloudflare worker，或者直接使用github action等等


### 动态更新

#### 补丁和更新
游戏更新目前采用人工维护的方式录入，我觉得可以先组织一个json。
填充这些字段 date\hero\content\patchType
hero可以配置为一个数组，这样可以支持多个英雄的动态更新，同时也支持通配符。
patchType是标识补丁的类型：buff\nerf\balance\update
update代表游戏机制的更新，无关具体某个英雄。

#### 英雄元数据
目前就是一个列表，包含 hero_key\hero_name\hero_icon\hero_role
考虑从`design/leaderboard.json`读取后你结合已有的知识来构造一份 `hero_meta.json`
未来如果新增英雄，直接在这个文件中添加即可。

