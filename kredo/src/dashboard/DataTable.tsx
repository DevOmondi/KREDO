import { CompactTable } from '@table-library/react-table-library/compact';
import { useTheme } from '@table-library/react-table-library/theme';
import { DEFAULT_OPTIONS, getTheme } from '@table-library/react-table-library/chakra-ui';
import { useRowSelect } from '@table-library/react-table-library/select';
import { Box, Checkbox } from '@chakra-ui/react';
const list = [
  {
    id: "1",
    name: "VSCode",
    deadline: new Date(2020, 1, 17),
    type: "SETUP",
    isComplete: true,
  },
  {
    id: "2",
    name: "JavaScript",
    deadline: new Date(2020, 2, 28),
    type: "LEARN",
    isComplete: true,
  },
  {
    id: "3",
    name: "React",
    deadline: new Date(2020, 3, 8),
    type: "LEARN",
    isComplete: false,
  },
];
const DataTable = () => {
  const data = { list };

  const chakraTheme = getTheme(DEFAULT_OPTIONS);
  const customTheme = {
    Table: `
      --data-table-library_grid-template-columns:  64px repeat(5, minmax(0, 1fr));
    `,
  };
  const theme = useTheme([chakraTheme, customTheme]);

  const select = useRowSelect(data, {
    onChange: onSelectChange,
  });

  function onSelectChange(action, state) {
    console.log(action, state);
  }

  const COLUMNS = [
    {
      label: 'Task',
      renderCell: (item) => item.name,
      select: {
        renderHeaderCellSelect: () => (
          <Checkbox
            colorScheme="teal"
            isChecked={select.state.all}
            isIndeterminate={!select.state.all && !select.state.none}
            onChange={select.fns.onToggleAll}
          />
        ),
        renderCellSelect: (item) => (
          <Checkbox
            colorScheme="teal"
            isChecked={select.state.ids.includes(item.id)}
            onChange={() => select.fns.onToggleById(item.id)}
          />
        ),
      },
    },
    {
      label: 'Deadline',
      renderCell: (item) =>
        item.deadline.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
    },
    { label: 'Type', renderCell: (item) => item.type },
    {
      label: 'Complete',
      renderCell: (item) => item.isComplete.toString(),
    },
    // { label: 'Tasks', renderCell: (item) => item.nodes?.length },
  ];

  return (
    <>
      <Box p={3} borderWidth="1px" borderRadius="lg">
        <CompactTable columns={COLUMNS} data={data} theme={theme} select={select} />
      </Box>
    </>
  );
};

export default DataTable;
// import { CompactTable } from '@table-library/react-table-library/compact';

// const nodes = [
//   {
//     id: '0',
//     name: 'Shopping List',
//     deadline: new Date(2020, 1, 15),
//     type: 'TASK',
//     isComplete: true,
//     nodes: 3,
//   },
// ];

// const COLUMNS = [
//   { label: 'Task', renderCell: (item) => item.name },
//   {
//     label: 'Deadline',
//     renderCell: (item) =>
//       item.deadline.toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: '2-digit',
//         day: '2-digit',
//       }),
//   },
//   { label: 'Type', renderCell: (item) => item.type },
//   {
//     label: 'Complete',
//     renderCell: (item) => item.isComplete.toString(),
//   },
//   { label: 'Tasks', renderCell: (item) => item.nodes },
// ];

// const Component = () => {
//   const data = { nodes };

//   return <CompactTable columns={COLUMNS} data={data} />;
// };

// export default Component;
