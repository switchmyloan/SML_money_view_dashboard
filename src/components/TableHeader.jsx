import { Edit2, Image, Trash2, Eye } from 'lucide-react';
const S3_IMAGE_PATH = import.meta.env.VITE_IMAGE_URL

export const blogColumn = ({ handleEdit }) => [
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Slug',
    accessorKey: 'slug',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: "Description",
    accessorKey: "description",
    cell: ({ getValue }) => (
      <div
        style={{
          minWidth: "150px",
          maxWidth: "200px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        className="tooltip cursor-pointer "
        data-tip={getValue() || "N/A"}
        title={getValue() || "N/A"}
      >
        {getValue() || "N/A"}
      </div>
    ),
  },
  {
    header: 'Banner',
    accessorKey: 'metaImage',
    cell: info => {
      const imageUrl = info.row.original.metaImage

      if (!imageUrl) {
        return null
      }
      const imagePath = `${S3_IMAGE_PATH}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
      console.log(imagePath, "imagePath")
      return (
        <>
          <img
            src={imagePath}
            alt="blog image"
            onError={(e) => {
              e.currentTarget.src = "https://dummyimage.com/100x50/cccccc/000000&text=No+Image"; // public folder me rakho
            }}
            style={{
              objectFit: 'cover',
              marginBottom: '10px',
              width: '100px',
              height: '50px',
              borderRadius: "0px"
            }}
          />

        </>
      )
    },
  },
  {
    header: 'Status',
    accessorKey: 'isActive',
    cell: ({ getValue }) => {
      const isActive = getValue(); // This returns a boolean: true or false

      // Determine the text and badge color based on the boolean value
      const statusText = isActive ? 'Active' : 'Inactive';
      const badgeColorClass = isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

      return (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${badgeColorClass}`}>
          {statusText}
        </span>
      );
    },
  },
  {
    header: 'Actions',
    accessorKey: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex space-x-3">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition"
          >
            <Edit2 size={20} />
          </button>
          {/* <button
            onClick={() => console.log('Delete', row.original)}
            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
          >
            <Trash2 size={20} />
          </button> */}
        </div>
      );
    },
  },
];
export const faqColumn = ({ handleEdit }) => [
  {
    header: 'Questions',
    accessorKey: 'question',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: "Answers",
    accessorKey: "answer",
    cell: ({ getValue }) => (
      <div
        style={{
          minWidth: "150px",
          maxWidth: "200px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        className="tooltip cursor-pointer "
        data-tip={getValue() || "N/A"}
        title={getValue() || "N/A"}
      >
        {getValue() || "N/A"}
      </div>
    ),
  },

  {
    header: 'Category',
    accessorKey: 'category_xid',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Featured',
    accessorKey: 'isFeatured',
    cell: ({ getValue }) => getValue() ? 'True' : 'False' || 'N/A',
  },
  {
    header: 'Actions',
    accessorKey: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex space-x-3">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition"
          >
            <Edit2 size={20} />
          </button>
          {/* <button
            onClick={() => console.log('Delete', row.original)}
            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
          >
            <Trash2 size={20} />
          </button> */}
        </div>
      );
    },
  },
];
export const testimonialsColumn = ({ handleEdit }) => [
  {
    header: 'Name',
    accessorKey: 'name',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Designation',
    accessorKey: 'designation',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Company',
    accessorKey: 'company',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Actions',
    accessorKey: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex space-x-3">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition"
          >
            <Edit2 size={20} />
          </button>
          {/* <button
            onClick={() => console.log('Delete', row.original)}
            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
          >
            <Trash2 size={20} />
          </button> */}
        </div>
      );
    },
  },
];
export const pressColumn = ({ handleEdit }) => [
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Description',
    accessorKey: 'description',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Order',
    accessorKey: 'order',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Actions',
    accessorKey: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex space-x-3">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition"
          >
            <Edit2 size={20} />
          </button>
          {/* <button
            onClick={() => console.log('Delete', row.original)}
            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
          >
            <Trash2 size={20} />
          </button> */}
        </div>
      );
    },
  },
];
export const bannerColumn = ({ handleEdit, handleDelete }) => [
  {
    header: 'Title',
    accessorKey: 'bannerTitle',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Description',
    accessorKey: 'bannerDescription',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Banner',
    accessorKey: 'bannerImage',
    cell: info => {
      const imageUrl = info.row.original.bannerImage

      if (!imageUrl) {
        return null
      }
      const imagePath = `${S3_IMAGE_PATH}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
      console.log(imagePath, "imagePath")
      return (
        <>
          <img src={imagePath} alt=""

            style={{
              objectFit: 'cover',
              marginBottom: '10px',
              width: '100px',
              height: '50px',
            }}
          />

        </>
      )
    },
  },
  {
    header: 'Status',
    accessorKey: 'isActive',
    cell: ({ getValue }) => getValue() ? 'True' : 'False',
  },
  {
    header: 'Actions',
    accessorKey: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex space-x-3">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition"
          >
            <Edit2 size={20} />
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
          >
            <Trash2 size={20} />
          </button>
        </div>
      );
    },
  },
];
export const lenderColumn = ({ handleEdit, handleDelete }) => [
  {
    header: 'Name',
    accessorKey: 'name',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Min Amount',
    accessorKey: 'minimumLoanAmount',
    cell: ({ getValue }) => {
      const income = getValue();

      if (income === null || income === undefined || isNaN(income)) {
        return 'N/A';
      }

      const formattedIncome = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(income);

      return formattedIncome;
    },
  },
  {
    header: 'Max Amount',
    accessorKey: 'maximumLoanAmount',
    cell: ({ getValue }) => {
      const income = getValue();

      if (income === null || income === undefined || isNaN(income)) {
        return 'N/A';
      }

      const formattedIncome = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(income);

      return formattedIncome;
    },
  },
  {
    header: 'Min Tenure',
    accessorKey: 'minimumTenure',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Max Tenure',
    accessorKey: 'maximumTenure',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Rate',
    accessorKey: 'startingInterestRate',
    cell: ({ getValue }) => getValue() || 'N/A',
  },


  {
    header: 'Status',
    accessorKey: 'isActive',
    cell: ({ getValue }) => {
      const isActive = getValue(); // This returns a boolean: true or false

      // Determine the text and badge color based on the boolean value
      const statusText = isActive ? 'Active' : 'Inactive';
      const badgeColorClass = isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

      return (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${badgeColorClass}`}>
          {statusText}
        </span>
      );
    },
  },
  {
    header: 'Actions',
    accessorKey: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex space-x-3">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition"
          >
            <Edit2 size={20} />
          </button>
          {/* <button
            onClick={() => handleDelete(row.original.id)}
            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
          >
            <Trash2 size={20} />
          </button> */}
        </div>
      );
    },
  },
];
export const leadsColumn = ({ handleEdit, handleDelete }) => [
  {
  header: 'SN', // Serial Number
  id: 'sn',
  enableSorting: false, // Serial numbers shouldn't be sortable
  maxSize: 50,
  cell: ({ row, table }) => {
    // 1. Get current pagination state from the table instance
    const { pageIndex, pageSize } = table.getState().pagination;
    
    // 2. Calculate the global row index
    // Formula: (Current Page Index * Page Size) + Row Index on current page + 1
    return (pageIndex * pageSize) + row.index + 1;
  },
},
  {
    header: 'Full Name',
    id: 'fullName',
    maxSize: 100,
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    cell: ({ getValue }) => {
      const fullName = getValue();

      return (
        // Apply classes to handle long names
        <div className="w-full overflow-hidden whitespace-normal">
          {fullName.trim() || 'N/A'}
        </div>
      );
    },
  },
  {
    header: 'MoneyView Msg',
    id: 'moneyViewMsg',
    accessorKey: 'lender_response',
    cell: ({ row }) => {
      const message = row.original.message;
      if (!message) {
        return <span className="text-gray-500">N/A</span>;
      }

      // Red Chip for Rejected Lead
      if (message.includes('rejected')) {
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
            {message}
          </span>
        );
      }

      // Yellow Chip for Duplicate User
      if (message.includes('Deduped)')) {
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
            {message}
          </span>
        );
      }
      if (message.includes('Invalid data to get offer for lead')) {
        return (
          <span className="inline-flex items-center rounded-full bg-orange-200 px-2 py-1 text-xs font-medium text-orange-800">
            {message}
          </span>
        );
      }

      // Green Chip for all other messages (Success/Generic)
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
          {message}
        </span>
      );
    },
  },
  // {
  //   header: 'Offer Amount',
  //   id: 'offerAmount',
  //   cell: ({ row }) => {
  //     console.log(row.original.lender_response?.MoneyView?.data?.resData?.data?.response?.offerObjects[0]?.loanAmount)
  //     const lenderResponse = row.original.lender_response?.MoneyView?.data?.resData?.data?.response?.offerObjects[0]?.loanAmount;

  //     console.log(lenderResponse, "lenderResponse")
  //     // Agar MoneyView response nahi hai ya reject/duplicate hai
  //     if (!lenderResponse) {
  //       return <span className="text-gray-500">N/A</span>;
  //     }

  //     const message = lenderResponse.message || '';
  //     const amount = lenderResponse || lenderResponse || null;

  //     // Sirf SUCCESS case mein dikhao (tune bola tha success pe)
  //     const isSuccess = !message.includes('rejected') && 
  //                       !message.includes('Duplicate') && 
  //                       !message.includes('Invalid');

  //     if (!isSuccess || !amount) {
  //       return <span className="text-gray-500">N/A</span>;
  //     }

  //     // Format as Indian currency
  //     const formatted = new Intl.NumberFormat('en-IN', {
  //       style: 'currency',
  //       currency: 'INR',
  //       maximumFractionDigits: 0,
  //     }).format(amount);

  //     return (
  //       <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1.5 text-sm font-bold text-green-800">
  //         {formatted}
  //       </span>
  //     );
  //   },
  // },
  {
    header: 'Number',
    accessorKey: 'phone',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Pan Card',
    accessorKey: 'panNumber',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Salary',
    accessorKey: 'salary',
    cell: ({ getValue }) => {
      const income = getValue();

      if (income === null || income === undefined || isNaN(income)) {
        return 'N/A';
      }

      const formattedIncome = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(income);

      return formattedIncome;
    },
  },
  {
    header: 'DOB',
    accessorKey: 'lender_response',
    cell: ({ row }) => {
      const dateStr = row.original.lender_response.MoneyView.data.payload.dateOfBirth;
      if (!dateStr) {
        return 'N/A';
      }

      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    },
  },
  {
    header: 'Created',
    accessorKey: 'createdAt',
    cell: ({ getValue }) => {
      const timestamp = getValue();

      if (timestamp && typeof timestamp === 'string' && timestamp.length >= 10) {
        // Get the first 10 characters (YYYY-MM-DD)
        return timestamp.substring(0, 10);
      }

      return timestamp || 'N/A';
    },
  },
  {
    header: 'Actions',
    accessorKey: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex space-x-3">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition"
          >
            <Eye size={20} />
          </button>
        </div>
      );
    },
  },
];
export const kbLogsColumn = ({ handleEdit, handleDelete }) => [
  {
  header: 'SN', // Serial Number
  id: 'sn',
  enableSorting: false, // Serial numbers shouldn't be sortable
  maxSize: 50,
  cell: ({ row, table }) => {
    // 1. Get current pagination state from the table instance
    const { pageIndex, pageSize } = table.getState().pagination;
    
    // 2. Calculate the global row index
    // Formula: (Current Page Index * Page Size) + Row Index on current page + 1
    return (pageIndex * pageSize) + row.index + 1;
  },
},
  {
    header: 'Full Name',
    id: 'fullName',
    maxSize: 100,
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    cell: ({ getValue }) => {
      const fullName = getValue();

      return (
        // Apply classes to handle long names
        <div className="w-full overflow-hidden whitespace-normal">
          {fullName.trim() || 'N/A'}
        </div>
      );
    },
  },
   {
    header: 'KB Msg',
    id: 'kbMsg',
    accessorKey: 'lender_response',
    cell: ({ row }) => {
      const message =  row.original.message;
      if (!message) {
        return <span className="text-gray-500">N/A</span>;
      }

      // Red Chip for Rejected Lead
      if (message.includes('Create leadStatus : Rejected')) {
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
            {message}
          </span>
        );
      }

      // Yellow Chip for Duplicate User
      if (message.includes('Deduped)')) {
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
            {message}
          </span>
        );
      }
      if (message.includes('Age not in valid range' || 'Token creation failed' || 'User pincode in invalid')) {
        return (
          <span className="inline-flex items-center rounded-full bg-orange-200 px-2 py-1 text-xs font-medium text-orange-800">
            {message}
          </span>
        );
      }

      // Green Chip for all other messages (Success/Generic)
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
          {message}
        </span>
      );
    },
  },
  
  {
    header: 'Number',
    accessorKey: 'phone',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Pan Card',
    accessorKey: 'panNumber',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Salary',
    accessorKey: 'salary',
    cell: ({ getValue }) => {
      const income = getValue();

      if (income === null || income === undefined || isNaN(income)) {
        return 'N/A';
      }

      const formattedIncome = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(income);

      return formattedIncome;
    },
  },

  {
    header: 'Created',
    accessorKey: 'createdAt',
    cell: ({ getValue }) => {
      const timestamp = getValue();

      if (timestamp && typeof timestamp === 'string' && timestamp.length >= 10) {
        // Get the first 10 characters (YYYY-MM-DD)
        return timestamp.substring(0, 10);
      }

      return timestamp || 'N/A';
    },
  },
  {
    header: 'Actions',
    accessorKey: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex space-x-3">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition"
          >
            <Eye size={20} />
          </button>
        </div>
      );
    },
  },
];
export const zypeSuccessColumn = ({ handleEdit, handleDelete }) => [
  {
  header: 'SN', // Serial Number
  id: 'sn',
  enableSorting: false, // Serial numbers shouldn't be sortable
  maxSize: 50,
  cell: ({ row, table }) => {
    // 1. Get current pagination state from the table instance
    const { pageIndex, pageSize } = table.getState().pagination;
    
    // 2. Calculate the global row index
    // Formula: (Current Page Index * Page Size) + Row Index on current page + 1
    return (pageIndex * pageSize) + row.index + 1;
  },
},
  {
    header: 'Full Name',
    id: 'fullName',
    maxSize: 100,
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    cell: ({ getValue }) => {
      const fullName = getValue();

      return (
        // Apply classes to handle long names
        <div className="w-full overflow-hidden whitespace-normal">
          {fullName.trim() || 'N/A'}
        </div>
      );
    },
  },
 {
  header: "Zype Msg",
  id: "moneyViewMsg",
  accessorKey: "lender_response",
  cell: ({ row }) => {
    const fullMessage =
      row.original.lender_response?.SMLCreadyZype?.message;

    if (!fullMessage) {
      return <span className="text-gray-500">N/A</span>;
    }

    // Extract only LAST word after last ":"
    const message = fullMessage.split(":").pop().trim();

    // Color Map
    const statusMap = [
      { keyword: "REJECT", classes: "bg-red-100 text-red-800" },
      { keyword: "in_progress", classes: "bg-blue-100 text-blue-800" },
      { keyword: "PRE_APPROVAL_IN_PROGRESS", classes: "bg-yellow-100 text-yellow-800" },
    ];

    const match = statusMap.find((s) =>
      message.toLowerCase().includes(s.keyword.toLowerCase())
    );

    const chipClass = match
      ? match.classes
      : "bg-green-100 text-green-800"; // default

    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${chipClass}`}
      >
        {message}
      </span>
    );
  },
},
  {
    header: 'Number',
    accessorKey: 'phone',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Pan Card',
    accessorKey: 'panNumber',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Salary',
    accessorKey: 'salary',
    cell: ({ getValue }) => {
      const income = getValue();

      if (income === null || income === undefined || isNaN(income)) {
        return 'N/A';
      }

      const formattedIncome = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(income);

      return formattedIncome;
    },
  },
  // {
  //   header: 'DOB',
  //   accessorKey: 'dob',
  //   cell: ({ getValue }) => {
  //     const dateStr = getValue();
  //     if (!dateStr) {
  //       return 'N/A';
  //     }

  //     const date = new Date(dateStr);
  //     const day = String(date.getDate()).padStart(2, '0');
  //     const month = String(date.getMonth() + 1).padStart(2, '0');
  //     const year = date.getFullYear();

  //     return `${day}/${month}/${year}`;
  //   },
  // },
  {
    header: 'Created',
    accessorKey: 'createdAt',
    cell: ({ getValue }) => {
      const timestamp = getValue();

      if (timestamp && typeof timestamp === 'string' && timestamp.length >= 10) {
        // Get the first 10 characters (YYYY-MM-DD)
        return timestamp.substring(0, 10);
      }

      return timestamp || 'N/A';
    },
  },
  {
    header: 'Actions',
    accessorKey: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex space-x-3">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition"
          >
            <Eye size={20} />
          </button>
        </div>
      );
    },
  },
];
export const businessColumn = ({ handleEdit, handleDelete }) => [
  {
  header: 'SN', // Serial Number
  id: 'sn',
  enableSorting: false, // Serial numbers shouldn't be sortable
  maxSize: 50,
  cell: ({ row, table }) => {
    // 1. Get current pagination state from the table instance
    const { pageIndex, pageSize } = table.getState().pagination;
    
    // 2. Calculate the global row index
    // Formula: (Current Page Index * Page Size) + Row Index on current page + 1
    return (pageIndex * pageSize) + row.index + 1;
  },
},
  {
    header: 'Company Name',
    accessorKey: 'companyName',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Turnover',
    id: 'turnover',
    accessorKey: 'turnover',
    cell: ({ getValue }) => {
      const value = getValue();

      // If value is missing or empty
      if (!value || value.trim() === '') {
        return <span className="text-gray-500">N/A</span>;
      }

      // Clean spacing and capitalization if needed
      const formatted = value
        .replace(/\s*-\s*/g, ' - ') // normalize spaces around dash
        .replace(/\blakh\b/gi, 'Lakh') // capitalize
        .replace(/\bcrore\b/gi, 'Crore');

      return (
        <div className="font-semibold text-blue-700">
          {formatted}
        </div>
      );
    },
  },
  {
    header: 'Firm Type',
    accessorKey: 'firmType',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Industry',
    accessorKey: 'industryType',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Full Name',
    id: 'fullName',
    maxSize: 100,
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    cell: ({ getValue }) => {
      const fullName = getValue();

      return (
        // Apply classes to handle long names
        <div className="w-full overflow-hidden whitespace-normal">
          {fullName.trim() || 'N/A'}
        </div>
      );
    },
  },
  {
    header: 'Required Loan',
    id: 'requiredLoanAmount',
    accessorKey: 'requiredLoanAmount',
    cell: ({ getValue }) => {
      const value = getValue();
      if (!value) return <span className="text-red-500 font-medium">Not Specified</span>;

      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(value);

      return (
        <div className="font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full inline-block">
          {formatted}
        </div>
      );
    },
  },

  {
    header: 'Number',
    accessorKey: 'phone',
    cell: ({ getValue }) => getValue() || 'N/A',
  },



  {
    header: 'Created',
    accessorKey: 'createdAt',
    cell: ({ getValue }) => {
      const timestamp = getValue();

      if (timestamp && typeof timestamp === 'string' && timestamp.length >= 10) {
        // Get the first 10 characters (YYYY-MM-DD)
        return timestamp.substring(0, 10);
      }

      return timestamp || 'N/A';
    },
  },
  {
    header: 'Actions',
    accessorKey: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex space-x-3">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition"
          >
            <Eye size={20} />
          </button>
        </div>
      );
    },
  },
];
export const ivrLogsColumn = ({ handleEdit, handleDelete }) => [
  {
  header: 'SN', // Serial Number
  id: 'sn',
  enableSorting: false, // Serial numbers shouldn't be sortable
  maxSize: 50,
  cell: ({ row, table }) => {
    // 1. Get current pagination state from the table instance
    const { pageIndex, pageSize } = table.getState().pagination;
    
    // 2. Calculate the global row index
    // Formula: (Current Page Index * Page Size) + Row Index on current page + 1
    return (pageIndex * pageSize) + row.index + 1;
  },
},
  {
    header: 'Full Name',
    id: 'fullName',
    maxSize: 100,
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    cell: ({ getValue }) => {
      const fullName = getValue();

      return (
        // Apply classes to handle long names
        <div className="w-full overflow-hidden whitespace-normal">
          {fullName.trim() || 'N/A'}
        </div>
      );
    },
  },
  {
    header: 'MoneyView Msg',
    id: 'moneyViewMsg',
    accessorKey: 'lender_response',
    cell: ({ row }) => {
      const message = row.original.lender_response?.MoneyView?.message;
      if (!message) {
        return <span className="text-gray-500">N/A</span>;
      }

      // Red Chip for Rejected Lead
      if (message.includes('Lead has been rejected')) {
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
            {message}
          </span>
        );
      }

      // Yellow Chip for Duplicate User
      if (message.includes('Duplicate User (Dedupe)')) {
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
            {message}
          </span>
        );
      }
      if (message.includes('Invalid data to get offer for lead')) {
        return (
          <span className="inline-flex items-center rounded-full bg-orange-200 px-2 py-1 text-xs font-medium text-orange-800">
            {message}
          </span>
        );
      }

      // Green Chip for all other messages (Success/Generic)
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
          {message}
        </span>
      );
    },
  },
  
  {
    header: 'Number',
    accessorKey: 'phone',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Salary',
    id: 'salary',
    accessorKey: 'salary',
    cell: ({ getValue }) => {
      const value = getValue();
      if (!value) return <span className="text-red-500 font-medium">Not Specified</span>;

      return (
        <div className="font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full inline-block">
          {value}
        </div>
      );
    },
  },
    {
    header: 'Profession',
    accessorKey: 'profession',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
    {
    header: 'Pan Number',
    accessorKey: 'panNumber',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
 
  {
    header: 'Created',
    accessorKey: 'createdAt',
    cell: ({ getValue }) => {
      const timestamp = getValue();

      if (timestamp && typeof timestamp === 'string' && timestamp.length >= 10) {
        // Get the first 10 characters (YYYY-MM-DD)
        return timestamp.substring(0, 10);
      }

      return timestamp || 'N/A';
    },
  },
  {
    header: 'Actions',
    accessorKey: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex space-x-3">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition"
          >
            <Eye size={20} />
          </button>
        </div>
      );
    },
  },
];
export const signInColumns = ({ handleEdit, handleDelete }) => [
  {
    header: 'First Name',
    accessorKey: 'firstName',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Last Name',
    accessorKey: 'lastName',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Number',
    accessorKey: 'phoneNumber',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Gender',
    accessorKey: 'gender',
    cell: ({ getValue }) => {
      const genderValue = getValue();
      // Normalize the value to a consistent case (e.g., lowercase)
      const normalizedGender = typeof genderValue === 'string' ? genderValue.toLowerCase() : genderValue;

      // Check for "male" or "female" using the normalized value
      const isMale = normalizedGender === 'male';
      const isFemale = normalizedGender === 'female';

      let genderText = 'N/A';
      let badgeColorClass = 'bg-gray-100 text-gray-800'; // Default for N/A

      if (isMale) {
        genderText = 'Male';
        badgeColorClass = 'bg-blue-100 text-blue-800';
      } else if (isFemale) {
        genderText = 'Female';
        badgeColorClass = 'bg-pink-100 text-pink-800';
      }

      return (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${badgeColorClass}`}>
          {genderText}
        </span>
      );
    },
  },
  {
    header: 'Job Type',
    accessorKey: 'jobType',
    cell: ({ getValue }) => {
      const jobType = getValue();

      // Function to convert to Title Case
      const toTitleCase = (str) => {
        if (!str) return 'N/A';
        return str
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };

      const formattedJobType = toTitleCase(jobType);

      // Define a mapping of job types to badge styles
      const badgeStyles = {
        'Salaried': 'bg-blue-100 text-blue-800',
        'Self-Employed': 'bg-green-100 text-green-800',
        'Self-employed': 'bg-green-100 text-green-800',
        'Business Owner': 'bg-purple-100 text-purple-800',
        'Freelancer': 'bg-yellow-100 text-yellow-800',
        'Student': 'bg-indigo-100 text-indigo-800',
        'Other': 'bg-gray-100 text-gray-800',
      };

      // Get the style for the formatted job type, defaulting to 'Other'
      const style = badgeStyles[formattedJobType] || badgeStyles['Other'];

      return (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${style}`}>
          {formattedJobType}
        </span>
      );
    },
  },
  {
    header: 'Income',
    accessorKey: 'monthlyIncome',
    cell: ({ getValue }) => {
      const income = getValue();

      if (income === null || income === undefined || isNaN(income)) {
        return 'N/A';
      }

      const formattedIncome = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(income);

      return formattedIncome;
    },
  },
  {
    header: 'DOB',
    accessorKey: 'dateOfBirth',
    cell: ({ getValue }) => {
      const dateStr = getValue();
      if (!dateStr) {
        return 'N/A';
      }

      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    },
  },
  {
    header: 'Actions',
    accessorKey: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex space-x-3">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition"
          >
            <Eye size={20} />
          </button>
        </div>
      );
    },
  },
];
export const archiveColumns = ({ handleEdit, handleDelete }) => [
  {
    header: 'FirstName',
    accessorKey: 'firstName',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'LastName',
    accessorKey: 'lastName',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'phoneNumber',
    accessorKey: 'phoneNumber',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'BioMetric',
    accessorKey: 'isBioMetricEnabled',
    cell: ({ getValue }) => getValue() ? 'True' : 'False',
  },
  {
    header: 'Mpin Enabled',
    accessorKey: 'isMpinEnabled',
    cell: ({ getValue }) => getValue() ? 'True' : 'False',
  },
  {
    header: 'Email Verified',
    accessorKey: 'isEmailVerified',
    cell: ({ getValue }) => getValue() ? 'True' : 'False',
  },

  {
    header: 'Phone Verified',
    accessorKey: 'isPhoneVerified',
    cell: ({ getValue }) => (
      <span className="flex space-x-3">
        {getValue() ? (
          <span className="p-2 font-semibold">Active</span>
        ) : (
          <span className="p-2 font-semibold">Inactive</span>
        )}
      </span>
    )
  },
  {
    header: 'Actions',
    accessorKey: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex space-x-3">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition"
          >
            <Eye size={20} />
          </button>
        </div>
      );
    },
  },
];