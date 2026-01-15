let CSRF_TOKEN = '';
let employeesData = [];

// Initialize CSRF Token
axios.get('/csrf-token')
    .then(response => {
        CSRF_TOKEN = response.data.token;
        document.querySelector('meta[name="csrf-token"]')
            .setAttribute('content', CSRF_TOKEN);
    })
    .catch(error => {
        console.error('Failed to fetch CSRF token:', error);
        showToast('Failed to initialize application', 'error');
    });

/* LOAD EMPLOYEES */
let employeeTable = null;

function loadEmployees() {
    axios.get('/api/employee-get')
        .then(response => {
            employeesData = response.data.data || [];

            // Destroy existing DataTable
            if (employeeTable) {
                employeeTable.destroy();
            }

            const tbody = document.querySelector('#employeeTable tbody');
            tbody.innerHTML = '';

            if (employeesData.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center text-muted py-4">
                            No employees found
                        </td>
                    </tr>
                `;
                return;
            }

            // Populate department filter
            populateDepartmentFilter(employeesData);

            employeesData.forEach(emp => {
                const statusClass = `status-${emp.status}`;
                const statusText = emp.status.charAt(0).toUpperCase() + emp.status.slice(1);

                tbody.innerHTML += `
                    <tr>
                        <td>${emp.employee_id}</td>
                        <td>${emp.first_name} ${emp.middle_name ? emp.middle_name + ' ' : ''}${emp.last_name}</td>
                        <td>${emp.email}</td>
                        <td>${emp.department || '-'}</td>
                        <td>${statusText}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-info" onclick="viewEmployeeDetails(${JSON.stringify(emp).replace(/"/g, '&quot;')})">
                                    <i class="bi bi-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-warning" onclick="openEditEmployeeModal(${JSON.stringify(emp).replace(/"/g, '&quot;')})">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteEmployee(${emp.employee_p_id}, '${emp.first_name} ${emp.last_name}')">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });

            initDataTable();
        })
        .catch(error => {
            console.error(error);
            showToast('Failed to load employees', 'error');
        });
}


function initDataTable() {
    employeeTable = $('#employeeTable').DataTable({
        pageLength: 10,
        lengthChange: false,
        ordering: true,
        searching: true,
        info: true,
        columnDefs: [
            { orderable: false, targets: 5 } // Actions column
        ]
    });

    // Search input
    $('#searchInput').on('keyup', function () {
        employeeTable.search(this.value).draw();
    });

    // Status filter
    $('#statusFilter').on('change', function () {
        employeeTable.column(4).search(this.value).draw();
    });

    // Department filter
    $('#departmentFilter').on('change', function () {
        employeeTable.column(3).search(this.value).draw();
    });
}

function populateDepartmentFilter(data) {
    const deptSelect = document.getElementById('departmentFilter');
    deptSelect.innerHTML = '<option value="">All Departments</option>';

    const departments = [...new Set(data.map(e => e.department).filter(Boolean))];

    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        deptSelect.appendChild(option);
    });
}
