import { SubjectButtons } from "./SubjectButtons.jsx";

export const getColumns = (onSubjectDelete) => [
  {
    name: "S No",
    selector: (row) => row.sno,
    cell: (row) => (
      <div className="w-full text-center">
        <span className="font-medium">{row.sno}</span>
      </div>
    ),
    width: "70px",
  },
  {
    name: "Kode",
    cell: (row) => (
      <div className="w-full text-center">
        <span className="font-medium">{row.sub_code || "-"}</span>
      </div>
    ),
    width: "100px",
  },
  {
    name: "Nama Mata Pelajaran",
    cell: (row) => (
      <div className="w-full text-center">
        <span className="font-medium">{row.sub_name || "-"}</span>
      </div>
    ),
  },
  {
    name: "Action",
    cell: (row) => (
      <div className="flex w-full justify-center items-center gap-2">
        <SubjectButtons _id={row._id} onSubjectDelete={onSubjectDelete} />
      </div>
    ),
  },
];
