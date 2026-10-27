// Галерея компонентов фильма №35 для проверки кадрами (только локально,
// отдельная точка входа dev/index.ts; в Root не регистрируется).
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { LOOKS } from "../rig/looks";
import { PHT_TEXT, PHT_TIME } from "../script";
import { ChildDrawing, Polo } from "../ui/car";
import { Accent, Card, DayLabel, Finger, Notification, Paper, Phone, StatusBar, Toast } from "../ui/kit";
import { BalaGoPage, ChatCard, CodeCard, ProjectBoard, ReportDoc, RequestForm, ScheduleApp, SchoolMessage, TaskList, WorkCalendar } from "../ui/screens";

const T = PHT_TEXT;

export const Gallery: React.FC = () => {
  const f = useCurrentFrame();
  const page = Math.floor(f / 10);
  const t = f % 10;
  const rows = [
    { time: PHT_TIME.morning, title: T.app.toSchool, who: T.app.dad, done: 1 },
    { time: PHT_TIME.pickup, title: T.app.fromSchool, who: T.app.mom, hi: 1 },
  ];
  return (
    <AbsoluteFill>
      <Paper>
        {page === 0 ? (
          <Phone x={190} y={330} w={700}>
            <StatusBar time="07:41" w={630} />
            <ScheduleApp w={630} day={0} dayLabel={T.app.today} rows={rows} />
          </Phone>
        ) : null}
        {page === 1 ? (
          <div style={{ position: "absolute", left: 140, top: 500 }}>
            <Notification w={800} title={T.app.keys} body={`${PHT_TIME.pickup} · ${T.app.fromSchool}`} time="12:55" />
            <div style={{ height: 60 }} />
            <Toast text={T.app.updated} k={1} />
          </div>
        ) : null}
        {page === 2 ? (
          <div style={{ position: "absolute", left: 120, top: 300 }}>
            <WorkCalendar
              w={840}
              h={1100}
              startHour={10}
              endHour={16}
              nowHour={12.4}
              events={[
                { from: 13, to: 14, title: T.app.meeting },
                { from: 13.33, to: 14, title: `${T.app.fromSchool} · Ата`, icon: "family", color: "#FFF1C2", hi: 1 },
              ]}
            />
          </div>
        ) : null}
        {page === 3 ? (
          <div style={{ position: "absolute", left: 90, top: 400 }}>
            <CodeCard w={900} typed={t / 9} f={f} />
          </div>
        ) : null}
        {page === 4 ? (
          <div style={{ position: "absolute", left: 90, top: 400 }}>
            <ProjectBoard w={900} moved={t / 9} />
          </div>
        ) : null}
        {page === 5 ? (
          <div style={{ position: "absolute", left: 130, top: 500 }}>
            <SchoolMessage w={820} from={PHT_TIME.pickup} to={PHT_TIME.wednesdayPickup} />
          </div>
        ) : null}
        {page === 6 ? (
          <div style={{ position: "absolute", left: 130, top: 500 }}>
            <ChatCard w={820} sentK={1} replyK={1} />
          </div>
        ) : null}
        {page === 7 ? (
          <div style={{ position: "absolute", left: 90, top: 500 }}>
            <ReportDoc w={900} f={f} />
          </div>
        ) : null}
        {page === 8 ? (
          <Phone x={190} y={300} w={700} screen="#FFFFFF">
            <BalaGoPage w={630} f={100} />
          </Phone>
        ) : null}
        {page === 9 ? (
          <Phone x={190} y={300} w={700} screen="#FFFFFF">
            <RequestForm w={630} f={t < 5 ? 60 : 200} fills={[10, 20, 30]} tapAt={70} sentAt={80} />
          </Phone>
        ) : null}
        {page === 10 ? (
          <Card style={{ position: "absolute", left: 110, top: 520, width: 860 }}>
            <TaskList w={860} f={100} typeFrom={10} typeTo={60} />
          </Card>
        ) : null}
        {page === 11 ? (
          <div style={{ position: "absolute", left: 90, top: 300 }}>
            <ChildDrawing w={900} />
            <div style={{ height: 80 }} />
            <Polo w={900} />
          </div>
        ) : null}
        {page === 12 ? (
          <>
            <DayLabel text="ДҮЙШӨМБҮ" f={20} />
            <Accent text={T.hookTitle} k={1} top={420} />
            <Finger x={540} y={1000} sleeve={LOOKS.dad.topColor} skin={LOOKS.dad.skin} shade={LOOKS.dad.skinShade} />
          </>
        ) : null}
      </Paper>
    </AbsoluteFill>
  );
};
