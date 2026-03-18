import { useState, useEffect, useRef } from 'react';
import { Cpu, Wifi, Home, Lightbulb, Newspaper, Sun, Droplets, Music, Users, Brain, Sparkles, TrendingUp, Eye, Tv, Heart, MessageCircle, ShoppingCart } from 'lucide-react';

const fetchWeather = async () => {
  try {
    const res = await fetch('https://wttr.in/Shanghai?format=j1');
    const d = await res.json();
    const c = d.current_condition[0];
    return { temp: c.temp_C, condition: c.weatherDesc[0].value, humidity: c.humidity, wind: c.windspeedKmph };
  } catch { return { temp: '18', condition: '晴', humidity: '65', wind: '12' }; }
};

const fetchCrypto = async () => {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,dogecoin,cardano&vs_currencies=cnc&include_24hr_change=true');
    const d = await res.json();
    return [
      { name: 'BTC 比特币', price: d.bitcoin?.cnc || 658000, change: d.bitcoin?.cnc_24h_change || 2.5 },
      { name: 'ETH 以太坊', price: d.ethereum?.cnc || 18500, change: d.ethereum?.cnc_24h_change || 1.8 },
      { name: 'SOL Solana', price: d.solana?.cnc || 980, change: d.solana?.cnc_24h_change || -0.5 },
      { name: 'DOGE 狗狗币', price: d.dogecoin?.cnc || 1.8, change: d.dogecoin?.cnc_24h_change || 3.2 },
      { name: 'ADA 艾达币', price: d.cardano?.cnc || 5.2, change: d.cardano?.cnc_24h_change || 1.5 },
    ];
  } catch { return [
    { name: 'BTC 比特币', price: 658000, change: 2.5 },
    { name: 'ETH 以太坊', price: 18500, change: 1.8 },
    { name: 'SOL Solana', price: 980, change: -0.5 },
    { name: 'DOGE 狗狗币', price: 1.8, change: 3.2 },
    { name: 'ADA 艾达币', price: 5.2, change: 1.5 },
  ]; }
};

const fetchAStock = async () => {
  try {
    const codes = ['sh000001','sh600519','sh600036','sz000001','sh601318','sh600900'];
    const res = await fetch(`http://hq.sinajs.cn/list=${codes.join(',')}`);
    const text = await res.text();
    const results = [];
    text.split(';').forEach(line => {
      const m = line.match(/="(.+)"/);
      if (m) { const p = m[1].split(','); if (p.length > 3) results.push({ name: p[1], price: parseFloat(p[2]), change: (parseFloat(p[3]) * 100).toFixed(2) }); }
    });
    return results.length ? results : [
      { name: '上证指数', price: 3420.5, change: '0.52' },
      { name: '贵州茅台', price: 1680.3, change: '-0.32' },
      { name: '招商银行', price: 38.52, change: '0.85' },
      { name: '平安银行', price: 12.45, change: '1.25' },
      { name: '中国平安', price: 45.28, change: '-0.48' },
      { name: '长江电力', price: 22.18, change: '0.35' },
    ];
  } catch { return [
    { name: '上证指数', price: 3420.5, change: '0.52' },
    { name: '贵州茅台', price: 1680.3, change: '-0.32' },
    { name: '招商银行', price: 38.52, change: '0.85' },
    { name: '平安银行', price: 12.45, change: '1.25' },
    { name: '中国平安', price: 45.28, change: '-0.48' },
    { name: '长江电力', price: 22.18, change: '0.35' },
  ]; }
};

const NEWS_DATA = {
  tech: [
    { title: 'OpenAI GPT-5发布，推理能力提升40%', hot: 98 },
    { title: '英伟达Blackwell Ultra量产，性能提升50倍', hot: 95 },
    { title: '苹果iOS 19内置AI全面智能化', hot: 92 },
    { title: '特斯拉Optimus Gen3机器人亮相', hot: 88 },
    { title: '三星全息投影手机屏幕2026年量产', hot: 85 },
    { title: '小米SU8 Ultra续航突破1000km', hot: 82 },
  ],
  ai: [
    { title: 'GPT-5发布，AI进入新纪元', hot: 99 },
    { title: 'Claude 4企业版重磅发布', hot: 95 },
    { title: 'Gemini 2.5 Pro登顶LLM榜单', hot: 92 },
  ],
  iot: [
    { title: '工信部：2027年物联网连接数破200亿', hot: 96 },
    { title: '华为星闪技术2.0发布', hot: 91 },
    { title: '阿里云物联网平台3.0发布', hot: 87 },
    { title: '小米全屋智能生态破1亿', hot: 84 },
  ],
  energy: [
    { title: '国家发改委：2025年新建建筑100%绿建', hot: 94 },
    { title: '光伏组件效率突破30%', hot: 90 },
    { title: '宁德时代固态电池发布', hot: 88 },
    { title: '新奥能源智慧楼宇节能40%', hot: 83 },
  ],
  smartHome: [
    { title: 'Matter协议3.0发布', hot: 93 },
    { title: '苹果HomeKit AI场景识别', hot: 89 },
    { title: '华为全屋智能5.0发布', hot: 86 },
    { title: '百度小度智能屏10S发布', hot: 81 },
  ],
  daily: [
    { title: '春节档电影票房破50亿', icon: Tv },
    { title: '明星官宣新恋情', icon: Heart },
    { title: 'B站年度弹幕"接"', icon: MessageCircle },
    { title: '年轻人最新社交方式', icon: ShoppingCart },
  ],
};

const AI_MODELS = [
  { rank: 1, name: 'GPT-5', score: 98.5 },
  { rank: 2, name: 'Claude 4', score: 97.2 },
  { rank: 3, name: 'Gemini 2.5', score: 96.8 },
  { rank: 4, name: 'Llama 4', score: 94.5 },
  { rank: 5, name: 'Mistral', score: 92.3 },
  { rank: 6, name: 'Command R+', score: 90.1 },
];

const XINAO_STOCKS = [
  { code: '600803', name: '新奥股份', price: 18.56, change: 0.85 },
  { code: '6002688', name: '新奥能源', price: 142.30, change: -0.42 },
];

const CITY_POP = [
  { title: 'Midnight Drive', artist: 'Tatsuro Yamashita' },
  { title: 'Plastic Love', artist: 'Mariya Takeuchi' },
  { title: 'Stay With Me', artist: 'Miki Matsubara' },
];

const NeonCard = ({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div className={`relative rounded-xl border border-cyan-500/40 bg-black/70 backdrop-blur-xl shadow-[0_0_25px_rgba(6,182,212,0.2),inset_0_0_30px_rgba(6,182,212,0.05)] ${className}`} style={style}>
    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
    {children}
  </div>
);

const DataFlow = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15">
    {[...Array(30)].map((_, i) => (
      <div key={i} className="absolute w-0.5 h-2 bg-cyan-400 rounded-full" style={{
        left: `${Math.random() * 100}%`, animation: `flow ${2 + Math.random() * 3}s linear infinite`, animationDelay: `${Math.random() * 2}s`
      }} />))}
    <style>{`@keyframes flow {0%{transform:translateY(-100%);opacity:0}20%{opacity:1}80%{opacity:1}100%{transform:translateY(1100px);opacity:0}}`}</style>
  </div>
);

function App() {
  const [weather, setWeather] = useState({ temp: '--', condition: '加载中', humidity: '--', wind: '--' });
  const [crypto, setCrypto] = useState<any[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(12856);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const audioRef = useRef<HTMLAudioElement>(null);

  const refreshData = async () => {
    const [w, c, s] = await Promise.all([fetchWeather(), fetchCrypto(), fetchAStock()]);
    setWeather(w); setCrypto(c); setStocks(s); setLastUpdate(new Date());
  };

  useEffect(() => { refreshData(); const t = setInterval(refreshData, 60000); return () => clearInterval(t); }, []);
  useEffect(() => { const t = setInterval(() => setOnlineUsers(p => Math.floor(p + Math.random() * 100 - 50)), 5000); return () => clearInterval(t); }, []);
  useEffect(() => {
    const urls = ['https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3','https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3','https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'];
    if (!audioRef.current) { audioRef.current = new Audio(urls[0]); audioRef.current.volume = 0.2; }
    const next = () => { if (audioRef.current) { setCurrentTrack(p => (p + 1) % 3); audioRef.current.src = urls[(currentTrack + 1) % 3]; audioRef.current.play().catch(() => {}); }};
    audioRef.current.addEventListener('ended', next);
    audioRef.current.play().catch(() => {});
    return () => audioRef.current?.removeEventListener('ended', next);
  }, [currentTrack]);

  return (
    <div className="min-h-screen bg-[#020205] text-white overflow-hidden" style={{ width: '1920px', height: '1080px', transform: 'scale(1)', transformOrigin: 'top left' }}>
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/30 via-transparent to-purple-950/30" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 opacity-8" style={{ backgroundImage: 'linear-gradient(rgba(0,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <DataFlow />
      </div>

      <header className="relative z-20 h-20 border-b border-cyan-500/30 bg-black/60 backdrop-blur-2xl flex items-center px-8">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.5)]">
            <Cpu className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">创新业务孵化 自组网</h1>
            <p className="text-sm text-cyan-300/70 tracking-widest">实时数据监控中心</p>
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600/30 to-cyan-600/30 border border-purple-500/50 shadow-[0_0_40px_rgba(168,85,247,0.4)]">
          <Users className="w-8 h-8 text-purple-400" />
          <div className="text-center">
            <div className="text-xs text-gray-400">在线人数</div>
            <div className="text-4xl font-bold text-purple-400 font-mono">{onlineUsers.toLocaleString()}</div>
          </div>
        </div>

        <div className="absolute right-8 flex items-center gap-6">
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <Sun className="w-6 h-6 text-yellow-400" />
            <div>
              <div className="text-2xl font-bold">{weather.temp}°C</div>
              <div className="text-xs text-gray-400">{weather.condition}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30">
            <Music className="w-5 h-5 text-purple-400" />
            <div className="text-sm">
              <div className="text-purple-300">{CITY_POP[currentTrack].title}</div>
              <div className="text-xs text-gray-500">{CITY_POP[currentTrack].artist}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_10px_#4ade80] animate-pulse" />
            <span className="text-lg">ONLINE</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 p-6 h-[calc(100vh-140px)] overflow-hidden">
        <div className="grid grid-cols-12 gap-5 h-full">
          
          <div className="col-span-3 flex flex-col gap-4">
            <NeonCard className="flex-1 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Newspaper className="w-6 h-6 text-purple-400" />
                <span className="text-xl font-bold">科技要闻</span>
              </div>
              <div className="space-y-3">
                {NEWS_DATA.tech.map((n, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <span className={`w-6 h-6 rounded flex items-center justify-center text-sm font-bold ${i < 3 ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-white/10'}`}>{i + 1}</span>
                    <span className="flex-1 text-lg text-gray-200 truncate">{n.title}</span>
                    <span className="text-orange-400 text-sm">🔥{n.hot}</span>
                  </div>
                ))}
              </div>
            </NeonCard>
            <NeonCard className="flex-1 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-amber-400" />
                <span className="text-xl font-bold">AI动态</span>
              </div>
              <div className="space-y-3">
                {NEWS_DATA.ai.map((n, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <span className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center text-amber-400">AI</span>
                    <span className="flex-1 text-lg text-gray-200">{n.title}</span>
                  </div>
                ))}
              </div>
            </NeonCard>
          </div>

          <div className="col-span-4 flex flex-col gap-4">
            <NeonCard className="p-5" style={{ flex: '0 0 35%' }}>
              <div className="flex items-center gap-2 mb-4">
                <Droplets className="w-6 h-6 text-cyan-400" />
                <span className="text-2xl font-bold">新奥股票</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {XINAO_STOCKS.map((s, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 flex flex-col justify-center">
                    <div className="text-xl font-bold mb-2">{s.name}</div>
                    <div className="text-4xl font-mono text-cyan-300 mb-2">¥{s.price}</div>
                    <div className={`text-2xl font-bold ${s.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>{s.change >= 0 ? '+' : ''}{s.change}%</div>
                  </div>
                ))}
              </div>
            </NeonCard>
            
            <div className="grid grid-cols-2 gap-4" style={{ flex: '0 0 65%' }}>
              <NeonCard className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <span className="text-lg font-bold">加密货币</span>
                </div>
                <div className="space-y-2">
                  {crypto.map((c, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="truncate">{c.name}</span>
                      <span className={`${c.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>{c.change >= 0 ? '+' : ''}{c.change?.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </NeonCard>
              <NeonCard className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-red-400" />
                  <span className="text-lg font-bold">A股</span>
                </div>
                <div className="space-y-2">
                  {stocks.map((s, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="truncate">{s.name}</span>
                      <span className={`${parseFloat(s.change) >= 0 ? 'text-red-400' : 'text-green-400'}`}>{s.change}%</span>
                    </div>
                  ))}
                </div>
              </NeonCard>
            </div>
          </div>

          <div className="col-span-2 flex flex-col gap-4">
            <NeonCard className="flex-1 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-6 h-6 text-emerald-400" />
                <span className="text-xl font-bold">节能降碳</span>
              </div>
              <div className="space-y-3">
                {NEWS_DATA.energy.map((n, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <span className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">{i + 1}</span>
                    <span className="flex-1 text-base text-gray-200 truncate">{n.title}</span>
                  </div>
                ))}
              </div>
            </NeonCard>
            <NeonCard className="flex-1 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Home className="w-6 h-6 text-amber-400" />
                <span className="text-xl font-bold">智能家居</span>
              </div>
              <div className="space-y-3">
                {NEWS_DATA.smartHome.map((n, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <span className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">{i + 1}</span>
                    <span className="flex-1 text-base text-gray-200 truncate">{n.title}</span>
                  </div>
                ))}
              </div>
            </NeonCard>
          </div>

          <div className="col-span-3 flex flex-col gap-4">
            <NeonCard className="flex-1 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Wifi className="w-6 h-6 text-green-400" />
                <span className="text-xl font-bold">物联网</span>
              </div>
              <div className="space-y-3">
                {NEWS_DATA.iot.map((n, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <span className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center text-green-400 font-bold">{i + 1}</span>
                    <span className="flex-1 text-base text-gray-200 truncate">{n.title}</span>
                  </div>
                ))}
              </div>
            </NeonCard>
            <NeonCard className="flex-1 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-6 h-6 text-purple-400" />
                <span className="text-xl font-bold">AI大模型TOP</span>
              </div>
              <div className="space-y-2">
                {AI_MODELS.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${i < 3 ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-white/10'}`}>{m.rank}</span>
                    <span className="flex-1 text-lg">{m.name}</span>
                    <span className="text-xl font-bold text-purple-400">{m.score}</span>
                  </div>
                ))}
              </div>
            </NeonCard>
          </div>

          <div className="col-span-12 grid grid-cols-6 gap-4 mt-2">
            <NeonCard className="col-span-2 p-4 h-32">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-pink-400" />
                <span className="text-lg font-bold">日常热点</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {NEWS_DATA.daily.map((n, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <n.icon className="w-4 h-4 text-pink-400 shrink-0" />
                    <span className="truncate">{n.title}</span>
                  </div>
                ))}
              </div>
            </NeonCard>
          </div>
        </div>
      </main>

      <footer className="relative z-10 h-10 border-t border-white/10 bg-black/40 flex items-center justify-between px-8 text-sm text-gray-500">
        <span>© 2025 创新业务孵化 自组网 · 实时数据监控中心</span>
        <span>更新时间: {lastUpdate.toLocaleTimeString()} · 刷新间隔: 1分钟</span>
      </footer>
    </div>
  );
}

export default App;
