import { useState, useEffect } from "react";
import {
  MapPin, Calendar, Users, ChevronRight, Search,
  Filter, Trophy, Clock, Zap, ArrowRight, CheckCircle,
  AlertCircle, Plus, ChevronDown, Home, Compass, List, BarChart2, User
} from "lucide-react";

const ORANGE = "#F4501E";

const contests = [
  { id:1, title:"2026 서울 오픈 크로스핏 챔피언십", location:"강남 CrossFit Arena", date:"5월 3일", fee:"45,000원", cur:148, max:200, level:"Rx", dday:7 },
  { id:2, title:"부산 강철 WOD", location:"해운대구", date:"5월 17일", fee:"35,000원", cur:62, max:100, level:"Rx", dday:21 },
  { id:3, title:"인천 박스 배틀", location:"연수구", date:"5월 24일", fee:"25,000원", cur:38, max:80, level:"Scaled", dday:28 },
  { id:4, title:"대전 첫 WOD 페스티벌", location:"유성구", date:"6월 7일", fee:"20,000원", cur:21, max:60, level:"Beginner", dday:45 },
];

const levelColor = { Rx:ORANGE, Scaled:"#7ab82e", Beginner:"#5b9fd4" };
const levelBg    = { Rx:"rgba(244,80,30,.12)", Scaled:"rgba(99,153,34,.1)", Beginner:"rgba(55,138,221,.1)" };

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

const cardAccents = [
  { bg:"#1a0f0a", pattern:"radial-gradient(ellipse at 20% 50%, rgba(244,80,30,.25) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(180,50,10,.15) 0%, transparent 50%)", abbr:"SO", sub:"SEOUL OPEN" },
  { bg:"#0a0e1a", pattern:"radial-gradient(ellipse at 80% 50%, rgba(55,100,200,.2) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(30,60,150,.15) 0%, transparent 50%)", abbr:"BS", sub:"BUSAN STEEL" },
  { bg:"#0a1a0f", pattern:"radial-gradient(ellipse at 50% 20%, rgba(60,160,80,.2) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(30,100,50,.15) 0%, transparent 50%)", abbr:"IB", sub:"INCHEON BATTLE" },
  { bg:"#150a1a", pattern:"radial-gradient(ellipse at 20% 80%, rgba(140,60,200,.2) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(100,30,160,.15) 0%, transparent 50%)", abbr:"DJ", sub:"DAEJEON FEST" },
];

function CardBanner({ accent, dday }) {
  return (
    <div style={{ height:88, background:accent.bg, backgroundImage:accent.pattern,
      borderRadius:"12px 12px 0 0", position:"relative", overflow:"hidden",
      display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ position:"absolute", inset:0, backgroundImage:
        "repeating-linear-gradient(45deg, rgba(255,255,255,.015) 0px, rgba(255,255,255,.015) 1px, transparent 1px, transparent 12px)" }} />
      <div style={{ textAlign:"center", position:"relative" }}>
        <div style={{ fontSize:28, fontWeight:700, letterSpacing:3,
          color:"rgba(255,255,255,.12)", lineHeight:1 }}>{accent.abbr}</div>
        <div style={{ fontSize:9, letterSpacing:3, color:"rgba(255,255,255,.2)",
          textTransform:"uppercase", marginTop:2 }}>{accent.sub}</div>
      </div>
      <div style={{ position:"absolute", top:8, right:10,
        fontSize:10, fontWeight:500, color: dday<=7 ? ORANGE : "rgba(255,255,255,.3)",
        background: dday<=7 ? "rgba(244,80,30,.15)" : "rgba(255,255,255,.06)",
        border:`1px solid ${dday<=7 ? "rgba(244,80,30,.35)" : "rgba(255,255,255,.08)"}`,
        padding:"3px 8px", borderRadius:4 }}>
        D-{dday}
      </div>
    </div>
  );
}

function Tag({ level }) {
  return (
    <span style={{ fontSize:10, fontWeight:500, padding:"3px 8px", borderRadius:4,
      background:levelBg[level], color:levelColor[level], letterSpacing:.3, whiteSpace:"nowrap" }}>
      {level}
    </span>
  );
}

function ContestCard({ c, idx, onClick }) {
  const accent = cardAccents[idx % cardAccents.length];
  const pct = Math.round(c.cur / c.max * 100);
  return (
    <div onClick={onClick}
      style={{ background:"#141416", border:"1px solid #242428", borderRadius:12,
        cursor:"pointer", transition:"border-color .15s", overflow:"hidden" }}
      onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(244,80,30,.35)"}
      onMouseLeave={e=>e.currentTarget.style.borderColor="#242428"}>
      <CardBanner accent={accent} dday={c.dday} />
      <div style={{ padding:14 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
          <Tag level={c.level} />
        </div>
        <div style={{ fontSize:13, fontWeight:500, color:"#fff", marginBottom:10, lineHeight:1.4 }}>{c.title}</div>
        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"#888", marginBottom:10 }}>
          <MapPin size={12} color="#555" />{c.location}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"#888", marginBottom:12 }}>
          <Calendar size={12} color="#555" />{c.date} · {c.fee}
        </div>
        <div style={{ height:2, background:"#242428", borderRadius:1, marginBottom:6 }}>
          <div style={{ height:"100%", width:`${pct}%`, background:ORANGE, borderRadius:1 }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#555" }}>
            <Users size={11} color="#555" />{c.cur} / {c.max}명
          </div>
          <button onClick={e=>e.stopPropagation()} style={{ background:ORANGE, border:"none", color:"#fff",
            fontSize:11, fontWeight:500, padding:"5px 14px", borderRadius:6, cursor:"pointer" }}>
            신청
          </button>
        </div>
      </div>
    </div>
  );
}

function HomePage({ setPage, isMobile }) {
  return (
    <div style={{ padding: isMobile ? "16px" : "24px" }}>
      {/* Hero */}
      <div style={{ background:"#141416", border:"1px solid #242428", borderRadius:14,
        padding: isMobile ? 18 : 24, marginBottom:22, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0,
          background:"radial-gradient(ellipse at 90% 50%, rgba(244,80,30,.07) 0%, transparent 60%)",
          pointerEvents:"none" }} />
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:ORANGE }} />
          <span style={{ fontSize:11, color:ORANGE, fontWeight:500 }}>마감 임박 · D-7</span>
        </div>
        <div style={{ fontSize: isMobile ? 17 : 20, fontWeight:500, color:"#fff", lineHeight:1.35, marginBottom:12 }}>
          2026 서울 오픈<br />크로스핏 챔피언십
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:12, marginBottom:14 }}>
          {[{Icon:MapPin,t:"강남 CrossFit Arena"},{Icon:Calendar,t:"2026년 5월 3일"}].map(({Icon,t},i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#888" }}>
              <Icon size={12} color="#666" />{t}
            </div>
          ))}
        </div>
        <div style={{ height:3, background:"#242428", borderRadius:2, marginBottom:6 }}>
          <div style={{ height:"100%", width:"74%", background:ORANGE, borderRadius:2 }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#555", marginBottom:18 }}>
          <div style={{ display:"flex", alignItems:"center", gap:4 }}>
            <Users size={11} color="#555" /> 148 / 200명
          </div>
          <span>74%</span>
        </div>
        <button onClick={()=>setPage("detail")} style={{ display:"flex", alignItems:"center",
          gap:6, background:ORANGE, border:"none", color:"#fff",
          padding: isMobile ? "9px 16px" : "10px 18px",
          borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer" }}>
          대회 상세 보기 <ArrowRight size={14} />
        </button>
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <span style={{ fontSize:14, fontWeight:500, color:"#fff" }}>다가오는 대회</span>
        <button onClick={()=>setPage("explore")} style={{ display:"flex", alignItems:"center",
          gap:3, fontSize:12, color:"#555", background:"none", border:"none", cursor:"pointer" }}>
          전체 보기 <ChevronRight size={13} />
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:10 }}>
        {contests.map((c,i)=>(
          <ContestCard key={c.id} c={c} idx={i} onClick={()=>setPage("detail")} />
        ))}
      </div>
    </div>
  );
}

function ExplorePage({ setPage, isMobile }) {
  const [activeRegion, setActiveRegion] = useState("전체");
  const [activeLevel,  setActiveLevel]  = useState("전체");
  return (
    <div style={{ padding: isMobile ? 16 : 24 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, background:"#141416",
        border:"1px solid #242428", borderRadius:10, padding:"10px 14px", marginBottom:14 }}>
        <Search size={14} color="#555" />
        <input placeholder="대회명, 지역 검색..." style={{ background:"transparent", border:"none",
          outline:"none", color:"#fff", fontSize:13, flex:1, fontFamily:"inherit" }} />
      </div>
      {[
        {label:"지역", opts:["전체","서울/경기","부산/경남","대전","제주"], active:activeRegion, set:setActiveRegion},
        {label:"부문", opts:["전체","Rx","Scaled","Beginner"],              active:activeLevel,  set:setActiveLevel},
      ].map(({label,opts,active,set})=>(
        <div key={label} style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:"#555", letterSpacing:.5, textTransform:"uppercase",
            marginBottom:6, display:"flex", alignItems:"center", gap:5 }}>
            <Filter size={10} color="#555" /> {label}
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {opts.map(o=>(
              <button key={o} onClick={()=>set(o)} style={{
                background: active===o ? "rgba(244,80,30,.1)" : "transparent",
                border:`1px solid ${active===o ? "rgba(244,80,30,.4)" : "#242428"}`,
                color: active===o ? ORANGE : "#666",
                fontSize:11, padding:"5px 12px", borderRadius:6,
                cursor:"pointer", fontFamily:"inherit", transition:"all .15s"
              }}>{o}</button>
            ))}
          </div>
        </div>
      ))}
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:10, marginTop:8 }}>
        {contests.map((c,i)=>(
          <ContestCard key={c.id} c={c} idx={i} onClick={()=>setPage("detail")} />
        ))}
      </div>
    </div>
  );
}

function DetailPage({ isMobile }) {
  return (
    <div style={{ padding: isMobile ? 16 : 24 }}>
      <div style={{ background:"#141416", border:"1px solid #242428", borderRadius:14, overflow:"hidden" }}>
        <div style={{ padding: isMobile ? 16 : 20, borderBottom:"1px solid #242428",
          position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0,
            background:"radial-gradient(ellipse at 100% 0%, rgba(244,80,30,.08) 0%, transparent 55%)",
            pointerEvents:"none" }} />
          <div style={{ display:"flex", gap:6, marginBottom:10 }}>
            {["Rx","Scaled","Beginner"].map(l=><Tag key={l} level={l} />)}
          </div>
          <div style={{ fontSize: isMobile ? 15 : 17, fontWeight:500, color:"#fff", marginBottom:4 }}>
            2026 서울 오픈 크로스핏 챔피언십
          </div>
          <div style={{ fontSize:12, color:"#666" }}>주최 · CrossFit Korea Official</div>
        </div>
        <div style={{ padding: isMobile ? 16 : 20 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
            {[
              {Icon:Calendar, label:"일시",   val:"5월 3일 09:00"},
              {Icon:MapPin,   label:"장소",   val:"강남 CF Arena"},
              {Icon:Zap,      label:"참가비", val:"45,000원"},
              {Icon:Clock,    label:"마감",   val:"D-7 임박!", hot:true},
            ].map(({Icon,label,val,hot})=>(
              <div key={label} style={{ background:"#1C1C20", borderRadius:8, padding:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:10,
                  color:"#555", textTransform:"uppercase", letterSpacing:.5, marginBottom:5 }}>
                  <Icon size={10} color="#555" />{label}
                </div>
                <div style={{ fontSize:13, fontWeight:500, color: hot ? ORANGE : "#fff" }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#555", marginBottom:6 }}>
              <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                <Users size={11} color="#555" /> 참가 현황
              </div>
              <span style={{ color:ORANGE, fontWeight:500 }}>148 / 200명</span>
            </div>
            <div style={{ height:4, background:"#242428", borderRadius:2 }}>
              <div style={{ height:"100%", width:"74%", background:ORANGE, borderRadius:2 }} />
            </div>
          </div>
          <div style={{ background:"#1C1C20", borderRadius:10, padding:14, marginBottom:16 }}>
            <div style={{ fontSize:10, color:ORANGE, letterSpacing:1, textTransform:"uppercase",
              fontWeight:500, marginBottom:12, display:"flex", alignItems:"center", gap:5 }}>
              <Zap size={11} color={ORANGE} /> WOD 종목
            </div>
            {["21-15-9 Thrusters (43/29kg) + Pull-ups",
              "10분 AMRAP — Box Jumps 10 + KB Swings 10",
              "1RM Snatch 개인 최고 기록 도전"].map((w,i)=>(
              <div key={i} style={{ display:"flex", gap:12, padding:"8px 0",
                borderBottom: i<2 ? "1px solid #242428" : "none" }}>
                <span style={{ color:ORANGE, fontWeight:500, fontSize:12, flexShrink:0 }}>0{i+1}</span>
                <span style={{ fontSize:12, color:"#999", lineHeight:1.5 }}>{w}</span>
              </div>
            ))}
          </div>
          <button style={{ width:"100%", background:ORANGE, border:"none", color:"#fff",
            padding:13, borderRadius:10, fontSize:14, fontWeight:500, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            참가 신청하기 <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

const rankData = [
  {pos:1,init:"KJ",name:"김정우",gym:"CrossFit Gangnam",score:"2:34",me:false},
  {pos:2,init:"LH",name:"이하준",gym:"CrossFit Hongdae",score:"2:41",me:false},
  {pos:3,init:"PS",name:"박서연",gym:"Iron Box Seoul",score:"2:55",me:false},
  {pos:4,init:"나",name:"나의 기록",gym:"CrossFit Mapo",score:"3:08",me:true},
  {pos:5,init:"CW",name:"최우진",gym:"Beast Mode CF",score:"3:12",me:false},
  {pos:6,init:"OH",name:"오현석",gym:"CrossFit Itaewon",score:"3:19",me:false},
];
const medColor = {1:"#FFD700",2:"#C0C0C0",3:"#CD7F32"};

function RankingPage({ isMobile }) {
  const [tab, setTab] = useState("Rx");
  return (
    <div style={{ padding: isMobile ? 16 : 24 }}>
      <div style={{ background:"#141416", border:"1px solid #242428", borderRadius:10,
        padding:"12px 16px", display:"flex", justifyContent:"space-between",
        alignItems:"center", marginBottom:14, cursor:"pointer" }}>
        <div>
          <div style={{ fontSize:13, fontWeight:500, color:"#fff" }}>2026 서울 오픈 챔피언십</div>
          <div style={{ fontSize:11, color:"#555", marginTop:2 }}>2026년 5월 3일</div>
        </div>
        <ChevronDown size={16} color="#555" />
      </div>
      <div style={{ display:"flex", gap:6, marginBottom:16 }}>
        {["Rx","Scaled","Beginner"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            flex:1, background: tab===t ? "rgba(244,80,30,.1)" : "#141416",
            border:`1px solid ${tab===t ? "rgba(244,80,30,.4)" : "#242428"}`,
            color: tab===t ? ORANGE : "#666",
            fontSize:12, padding:"8px 0", borderRadius:8,
            cursor:"pointer", fontFamily:"inherit", transition:"all .15s"
          }}>{t}</button>
        ))}
      </div>
      <div style={{ background:"#141416", border:"1px solid #242428", borderRadius:12, overflow:"hidden" }}>
        {rankData.map((r,i)=>(
          <div key={r.pos} style={{ display:"flex", alignItems:"center",
            padding: isMobile ? "11px 14px" : "12px 16px",
            borderBottom: i<rankData.length-1 ? "1px solid #1C1C20" : "none",
            background: r.me ? "rgba(244,80,30,.04)" : "transparent" }}>
            <div style={{ width:26, fontSize:14, fontWeight:500, color:medColor[r.pos]||"#444", flexShrink:0 }}>{r.pos}</div>
            <div style={{ width:32, height:32, borderRadius:"50%", marginRight:12, flexShrink:0,
              background: r.me ? "rgba(244,80,30,.15)" : "#1C1C20",
              border:`1px solid ${r.me ? "rgba(244,80,30,.3)" : "#2a2a2a"}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:11, color: r.me ? ORANGE : "#666" }}>{r.init}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:500, color: r.me ? ORANGE : "#fff",
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.name}</div>
              <div style={{ fontSize:11, color:"#555", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.gym}</div>
            </div>
            <div style={{ fontSize:14, fontWeight:500, color: r.me ? ORANGE : "#ccc",
              fontVariantNumeric:"tabular-nums", flexShrink:0, marginLeft:8 }}>{r.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MyPage({ isMobile }) {
  const [result, setResult] = useState("");
  return (
    <div style={{ padding: isMobile ? 16 : 24 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:20 }}>
        {[{n:"3",l:"신청 대회"},{n:"4위",l:"최고 순위",hot:true},{n:"2",l:"완료 대회"}].map(({n,l,hot})=>(
          <div key={l} style={{ background:"#141416", border:"1px solid #242428",
            borderRadius:10, padding:12, textAlign:"center" }}>
            <div style={{ fontSize: isMobile ? 19 : 22, fontWeight:500, color:hot?ORANGE:"#fff" }}>{n}</div>
            <div style={{ fontSize:10, color:"#555", marginTop:3, textTransform:"uppercase", letterSpacing:.3 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:14, fontWeight:500, color:"#fff", marginBottom:12 }}>참가 내역</div>

      {[
        { title:"2026 서울 오픈 챔피언십", date:"5월 3일", loc:"강남 CF Arena", status:"reg" },
        { title:"2026 봄 인천 오픈",       date:"4월 5일", loc:"인천 연수구",   status:"done",
          rank:"4위 / 89명", record:"3:08" },
        { title:"2025 부산 겨울 배틀",     date:"12월 14일", loc:"해운대구",    status:"pending" },
      ].map((item)=>(
        <div key={item.title} style={{ background:"#141416", border:"1px solid #242428",
          borderRadius:12, padding:16, marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"start", marginBottom:8 }}>
            <div style={{ fontSize:13, fontWeight:500, color:"#fff", flex:1, marginRight:8, lineHeight:1.4 }}>
              {item.title}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:4, borderRadius:4,
              padding:"3px 8px", fontSize:10, fontWeight:500, whiteSpace:"nowrap", flexShrink:0,
              ...(item.status==="reg"     ? {background:"rgba(244,80,30,.1)",  border:"1px solid rgba(244,80,30,.2)",  color:ORANGE} :
                  item.status==="done"    ? {background:"rgba(99,153,34,.08)", border:"1px solid rgba(99,153,34,.2)",  color:"#7ab82e"} :
                                            {background:"rgba(160,160,170,.06)",border:"1px solid #2a2a2a",            color:"#555"}) }}>
              {item.status==="reg"     && <><CheckCircle size={10} /> 신청 완료</>}
              {item.status==="done"    && <><CheckCircle size={10} /> 완료</>}
              {item.status==="pending" && <><AlertCircle size={10} /> 미등록</>}
            </div>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#666" }}>
              <Calendar size={11} color="#555" />{item.date}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#666" }}>
              <MapPin size={11} color="#555" />{item.loc}
            </div>
          </div>
          {item.status==="done" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:12 }}>
              {[{label:"최종 순위",val:item.rank,hot:true},{label:"WOD 1 기록",val:item.record}].map(({label,val,hot})=>(
                <div key={label} style={{ background:"#1C1C20", borderRadius:8, padding:"10px 12px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:10,
                    color:"#555", textTransform:"uppercase", letterSpacing:.3, marginBottom:4 }}>
                    <Trophy size={10} color="#555" />{label}
                  </div>
                  <div style={{ fontSize:15, fontWeight:500, color:hot?ORANGE:"#fff" }}>{val}</div>
                </div>
              ))}
            </div>
          )}
          {item.status==="pending" && (
            <div style={{ display:"flex", gap:8, marginTop:12 }}>
              <input value={result} onChange={e=>setResult(e.target.value)}
                placeholder="기록 입력 (예: 3:24 또는 157 reps)"
                style={{ flex:1, background:"#1C1C20", border:"1px solid #2a2a2a", borderRadius:8,
                  padding:"9px 12px", fontSize:12, color:"#fff", fontFamily:"inherit", outline:"none",
                  minWidth:0 }} />
              <button style={{ background:ORANGE, border:"none", color:"#fff", padding:"9px 14px",
                borderRadius:8, fontSize:12, fontWeight:500, cursor:"pointer",
                display:"flex", alignItems:"center", gap:4, fontFamily:"inherit", flexShrink:0 }}>
                <Plus size={13} /> 등록
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const navItems = [
  { id:"home",    Icon:Home,     label:"홈" },
  { id:"explore", Icon:Compass,  label:"탐색" },
  { id:"detail",  Icon:List,     label:"상세" },
  { id:"ranking", Icon:BarChart2,label:"랭킹" },
  { id:"my",      Icon:User,     label:"내 대회" },
];

export default function App() {
  const [page, setPage] = useState("home");
  const isMobile = useIsMobile();

  return (
    <div style={{ background:"#0C0C0E", borderRadius:16, overflow:"hidden",
      fontFamily:"var(--font-sans)", minHeight:560,
      display:"flex", flexDirection:"column" }}>

      {/* TOP NAV — PC에서만 */}
      {!isMobile && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"12px 24px", background:"#0C0C0E", borderBottom:"1px solid #1C1C20", flexShrink:0 }}>
          <div style={{ fontSize:16, fontWeight:500, letterSpacing:"-0.5px", color:"#fff" }}>
            WOD<span style={{ color:ORANGE }}>Meet</span>
          </div>
          <div style={{ display:"flex", gap:2, background:"#141416",
            borderRadius:10, padding:3, border:"1px solid #1C1C20" }}>
            {navItems.map(({id,label})=>(
              <button key={id} onClick={()=>setPage(id)} style={{
                background: page===id ? "#0C0C0E" : "transparent",
                border:"none", color: page===id ? "#fff" : "#555",
                fontSize:12, padding:"6px 14px", borderRadius:8,
                cursor:"pointer", fontFamily:"inherit", transition:"all .15s",
                boxShadow: page===id ? "0 1px 4px rgba(0,0,0,.5)" : "none"
              }}>{label}</button>
            ))}
          </div>
        </div>
      )}

      {/* 모바일 상단 로고 */}
      {isMobile && (
        <div style={{ padding:"14px 16px", background:"#0C0C0E",
          borderBottom:"1px solid #1C1C20", flexShrink:0 }}>
          <div style={{ fontSize:16, fontWeight:500, letterSpacing:"-0.5px", color:"#fff" }}>
            WOD<span style={{ color:ORANGE }}>Meet</span>
          </div>
        </div>
      )}

      {/* PAGE CONTENT */}
      <div style={{ flex:1, overflowY:"auto" }}>
        {page==="home"    && <HomePage    setPage={setPage} isMobile={isMobile} />}
        {page==="explore" && <ExplorePage setPage={setPage} isMobile={isMobile} />}
        {page==="detail"  && <DetailPage  isMobile={isMobile} />}
        {page==="ranking" && <RankingPage isMobile={isMobile} />}
        {page==="my"      && <MyPage      isMobile={isMobile} />}
      </div>

      {/* BOTTOM NAV — 모바일에서만 */}
      {isMobile && (
        <div style={{ display:"flex", background:"#0C0C0E",
          borderTop:"1px solid #1C1C20", flexShrink:0 }}>
          {navItems.map(({id,Icon,label})=>(
            <button key={id} onClick={()=>setPage(id)} style={{
              flex:1, display:"flex", flexDirection:"column", alignItems:"center",
              justifyContent:"center", gap:4, padding:"10px 0",
              background:"transparent", border:"none", cursor:"pointer",
              color: page===id ? ORANGE : "#555", fontFamily:"inherit", transition:"color .15s"
            }}>
              <Icon size={20} strokeWidth={page===id ? 2 : 1.5} />
              <span style={{ fontSize:10 }}>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
