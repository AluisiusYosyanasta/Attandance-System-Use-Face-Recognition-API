import { ScheduleButtons } from "./ScheduleButtons.jsx";

export const getColumns = (onScheduleDelete) => [
  {
    name: "S No",
    selector: (row) => row.sno,
    cell: (row) => (
      <div className="w-full text-center">
        <span className="font-medium">{row.sno ?? "-"}</span>
      </div>
    ),
    width: "70px",
  },
  {
    name: "Mata Pelajaran",
    cell: (row) => (
      <div className="text-left">
        <span className="font-medium">{row.subject?.sub_name || "-"}</span>
      </div>
    ),
  },
  {
    name: "Kelas",
    cell: (row) => (
      <div className="text-left">
        <span className="font-medium">{row.room_cls?.room_name || "-"}</span>
      </div>
    ),
    width: "70px",
  },
  {
    name: "Hari",
    cell: (row) => (
      <div className="text-left">
        <span className="font-medium">{row.day || "-"}</span>
      </div>
    ),
    width: "150px",
  },
  {
    name: "Mulai",
    cell: (row) => (
      <div className="text-left">
        <span className="font-medium">{row.startTime || "-"}</span>
      </div>
    ),
    width: "100px",
  },
  {
    name: "Selesai",
    cell: (row) => (
      <div className="text-left">
        <span className="font-medium">{row.endTime || "-"}</span>
      </div>
    ),
    width: "100px",
  },
  {
    name: "Jenis Ujian",
    cell: (row) => (
      <div className="text-left">
        <span className="font-medium">{row.examType || "Tidak Ujian"}</span>
      </div>
    ),
    width: "120px",
  },
  {
    name: "Guru",
    cell: (row) => (
      <div className="text-left">
        <span className="font-medium">{row.guruId?.userId.name || "-"}</span>
      </div>
    ),
  },
  {
    name: "Action",
    cell: (row) => (
      <div className="flex justify-center items-center gap-2">
        <ScheduleButtons _id={row._id} onScheduleDelete={onScheduleDelete} />
      </div>
    ),
  },
];
