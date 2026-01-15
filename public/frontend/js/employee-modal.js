let employeeMode = 'create';
let currentEmployeeId = null;

/* OPEN CREATE MODAL */
function openCreateEmployeeModal() {
    employeeMode = 'create';
    document.getElementById('employeeModalTitle').innerText = 'Add Employee';
    document.getElementById('employeeForm').reset();
    document.getElementById('employee_p_id').value = '';
    document.getElementById('formErrors').innerHTML = '';
    
    // Hide status field for create
    document.getElementById('statusField').classList.add('d-none');
    // document.getElementById('status').value = 'active'; // Set default
    
    window.employeeModal.show();
}

/* OPEN EDIT MODAL */
function openEditEmployeeModal(employee) {
    employeeMode = 'edit';
    document.getElementById('employeeModalTitle').innerText = 'Edit Employee';
    currentEmployeeId = employee.employee_p_id;

    // Fill form
    document.getElementById('employee_p_id').value = employee.employee_p_id;
    document.getElementById('first_name').value = employee.first_name;
    document.getElementById('middle_name').value = employee.middle_name ?? '';
    document.getElementById('last_name').value = employee.last_name;
    document.getElementById('email').value = employee.email;
    document.getElementById('phone').value = employee.phone ?? '';
    document.getElementById('date_hired').value = employee.date_hired;
    document.getElementById('department').value = employee.department ?? '';
    document.getElementById('position').value = employee.position ?? '';
    document.getElementById('salary').value = employee.salary ?? '';
    document.getElementById('status').value = employee.status;

    // Show status field for edit
    document.getElementById('statusField').classList.remove('d-none');
    
    document.getElementById('formErrors').innerHTML = '';
    window.employeeModal.show();
}

/* SUBMIT EMPLOYEE FORM */
function submitEmployeeForm() {
    const salary = parseFloat(document.getElementById('salary').value);

    // Validation
    if (isNaN(salary) || salary < 15000) {
        showToast('Monthly salary must be at least ₱15,000', 'error');
        return;
    }

    if (!document.getElementById('department').value) {
        showToast('Please select a department', 'error');
        return;
    }

    // form
    const formData = {
        first_name: document.getElementById('first_name').value,
        middle_name: document.getElementById('middle_name').value,
        last_name: document.getElementById('last_name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        date_hired: document.getElementById('date_hired').value,
        department: document.getElementById('department').value,
        position: document.getElementById('position').value,
        salary: document.getElementById('salary').value
    };

    // Add status only for edit mode
    if (employeeMode === 'edit') {
        formData.status = document.getElementById('status').value;
    }

    const url = employeeMode === 'create' 
        ? '/api/employee-store' 
        : `/api/employee-update/${currentEmployeeId}`;
    
    const method = employeeMode === 'create' ? 'POST' : 'PUT';

    showToast('Saving employee...', 'info');

    axios({
        method: method,
        url: url,
        data: formData,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': CSRF_TOKEN
        }
    })
    .then(response => {
        window.employeeModal.hide();
        showToast(response.data.message, 'success');
        loadEmployees();
    })
    .catch(error => {
        if (error.response && error.response.status === 422) {
            displayValidationErrors(error.response.data.errors);
            showToast('Please follow the requirements', 'error');
        } else {
            console.error('Error:', error);
            showToast('Failed to save employee', 'error');
        }
    });
}

/* DISPLAY VALIDATION ERRORS */
function displayValidationErrors(errors) {
    const errorContainer = document.getElementById('formErrors');
    errorContainer.innerHTML = '';
    
    Object.keys(errors).forEach(key => {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger py-1';
        errorDiv.textContent = errors[key][0];
        errorContainer.appendChild(errorDiv);
    });
}

/* DELETE EMPLOYEE WITH SWEETALERT */
function deleteEmployee(employeeId, employeeName) {
    Swal.fire({
        title: 'Are you sure?',
        text: `Delete employee "${employeeName}"? This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            axios.delete(`/api/employee-delete/${employeeId}`, {
                headers: {
                    'X-CSRF-TOKEN': CSRF_TOKEN
                }
            })
            .then(response => {
                showToast(response.data.message, 'success');
                loadEmployees();
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('Failed to delete employee', 'error');
            });
        }
    });
}

/* VIEW EMPLOYEE DETAILS */
function viewEmployeeDetails(employee) {
    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount) return '-';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const badges = {
            'active': '<span class="badge bg-success">Active</span>',
            'resigned': '<span class="badge bg-warning text-dark">Resigned</span>',
            'terminated': '<span class="badge bg-danger">Terminated</span>'
        };
        return badges[status] || '<span class="badge bg-secondary">Unknown</span>';
    };

    // Fill view modal
    document.getElementById('view-employee_id').textContent = employee.employee_id;
    document.getElementById('view-status').innerHTML = getStatusBadge(employee.status);
    document.getElementById('view-first_name').textContent = employee.first_name;
    document.getElementById('view-middle_name').textContent = employee.middle_name || '-';
    document.getElementById('view-last_name').textContent = employee.last_name;
    document.getElementById('view-email').textContent = employee.email;
    document.getElementById('view-phone').textContent = employee.phone || '-';
    document.getElementById('view-date_hired').textContent = formatDate(employee.date_hired);
    document.getElementById('view-department').textContent = employee.department || '-';
    document.getElementById('view-position').textContent = employee.position || '-';
    document.getElementById('view-salary').textContent = formatCurrency(employee.salary);
    document.getElementById('view-created_at').textContent = formatDate(employee.created_at);
    document.getElementById('view-updated_at').textContent = formatDate(employee.updated_at);

    window.viewModal.show();
}

/* SHOW TOAST NOTIFICATION */
let activeToast = null;
let toastTimeout = null;

function showToast(message, type = 'info') {
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };

    // Clear any pending timeout
    if (toastTimeout) {
        clearTimeout(toastTimeout);
        toastTimeout = null;
    }

    // Hide and remove previous toast
    if (activeToast) {
        // Toastify doesn't have a direct hide method, so we remove the element
        const toastElements = document.querySelectorAll('.toastify');
        toastElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            }, 300);
        });
        activeToast = null;
    }

    // Create new toast
    activeToast = Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: colors[type] || colors.info,
        stopOnFocus: true,
        close: true,
        style: {
            transition: 'all 0.3s ease'
        },
        callback: function() {
            activeToast = null;
            toastTimeout = null;
        }
    }).showToast();

    // Set timeout to clear reference
    toastTimeout = setTimeout(() => {
        activeToast = null;
        toastTimeout = null;
    }, 3000);
}