# Departments migration guide (parts 3–7)

You’ve done **part 1 (types)** and **part 2 (department API)**. This guide walks through **parts 3, 4, 5, 6, and 7** one by one.

---

## Part 3: Employees API

**Goal:** Employees API uses `department_id` and the `departments` table. No more `department` text.

### 3.1 Update employee reads (list + by id)

- In `lib/api/employees.ts`:
  - **fetchEmployees:** Keep selecting from `employees`. Add a join so each row includes the department name, e.g.  
    `select('*, departments(id, name)')`  
    so the result has `employees.departments` (or your chosen alias).  
    If your FK column is `department_id`, PostgREST will return something like `departments: { id, name }` for each employee.
  - **fetchEmployeeById:** Same: `select('*, departments(id, name)')` so the single employee has department info for the form.

- **Important:** Ensure the employees table has `department_id` (FK to departments). The migration already added it. The Supabase client uses the foreign key name: so the relation might be exposed as `departments` (singular) when you use `.select('*, departments(...)')` — check your Supabase schema. Often it’s `department_id` → relation name `departments` (the table name).

### 3.2 Update employee create/update

- In **createEmployee** and **updateEmployee** (in `lib/api/employees.ts`):
  - Use **department_id** (uuid or null) in the payload.
  - Remove any use of **department** (text) when building the insert/update object.

### 3.3 Replace fetchDepartments in employees.ts

- You currently have **fetchDepartments** in `lib/api/employees.ts` that derived departments from the old `department` column. That column is gone.
- **Remove** that function (and its export) from `lib/api/employees.ts`.
- **Replace** its usage everywhere with the department API from **part 2**:
  - Import and use **useDepartments** (or **fetchDepartments**) from `@/lib/api/department` for:
    - Employee list page **filter dropdown** (department options).
    - Any other place that needs “list of departments”.

### 3.4 Types

- In **types/employees.ts** (if not already done in part 1):
  - Employee type: **department_id: string | null** (and optionally **departments?: { id: string; name: string }** if you join).
  - CreateEmployeeInput / UpdateEmployeeInput: **department_id?: string | null** (no **department**).

**Checklist part 3:**  
- [ ] fetchEmployees returns department info (join or departments object).  
- [ ] fetchEmployeeById returns department info.  
- [ ] createEmployee and updateEmployee use department_id only.  
- [ ] Old fetchDepartments removed from employees API; all callers use `@/lib/api/department`.  
- [ ] Employee types use department_id (and optional joined departments).

---

## Part 4: Settings page (Departments)

**Goal:** Settings → Departments uses the **departments table** and the **department API**. No more app_settings JSON for departments.

### 4.1 Data source

- In **app/dashboard/settings/page.tsx**:
  - Remove usage of **usePredefinedDepartments** and **useUpdatePredefinedDepartments** from `@/lib/api/settings`.
  - Use instead:
    - **useDepartments** from `@/lib/api/department` for the list.
    - **useCreateDepartment** to add a department (name from input).
    - Optionally **useUpdateDepartment** / **useDeleteDepartment** if you want edit/delete in the UI.

### 4.2 UI behavior

- **List:** Map `data` from `useDepartments()` to show department names (and ids if needed).
- **Add:** Input for name + button that calls `createDepartment({ name })` (or the create mutation). Trim and validate non-empty.
- **Remove (optional):** For each row, a delete button that calls `deleteDepartment(id)` (or the delete mutation). You can show a warning if the department is still in use (employees with that department_id).
- **Save:** No “Save” needed for the list itself — add/update/delete are immediate. If you had a “Save departments” button, it can be removed; each action is a mutation.

### 4.3 Permissions

- Keep “Only admins can change departments” (or similar) and only show add/remove/update to users with admin role. Reading the list can stay for admin/finance/viewer as per your RLS.

**Checklist part 4:**  
- [ ] Settings page uses useDepartments from department API.  
- [ ] Add department uses createDepartment (department API).  
- [ ] No imports from settings API for “predefined departments”.  
- [ ] Optional: delete (and edit) department from Settings using department API.

---

## Part 5: Employee form (Add / Edit)

**Goal:** Add/Edit employee uses **department_id** and department options from the **department API**.

### 5.1 Data

- In **components/employees/AddEmployeesForm.tsx**:
  - Use **useDepartments** from `@/lib/api/department` (not from settings).
  - Options for the department dropdown: `departments.map(d => ({ value: d.id, label: d.name }))`.

### 5.2 Form state and submit

- Form state should include **department_id: string | null** (not `department`).
  - For **create:** initial value can be `null` or the first department id.
  - For **edit:** initial value = `employee.department_id` (from API in part 3).
- On submit, send **department_id** in the payload for both create and update. Do not send `department` text.

### 5.3 Dropdown

- Use a **Select** (or your shared SelectDropdown) with:
  - `value={form.department_id ?? ""}` (or a placeholder like “Select department” when null).
  - `onValueChange={(v) => setForm(prev => ({ ...prev, department_id: v || null }))}`.
  - Options: one per department from `useDepartments()` (e.g. value = `d.id`, label = `d.name`).
- If you had a fallback when “no predefined departments” (e.g. text input), you can remove it once the departments table is the only source; otherwise keep a single “Unassigned” or allow null and show “No department” in the dropdown.

**Checklist part 5:**  
- [ ] AddEmployeesForm uses useDepartments from department API.  
- [ ] Form state has department_id (no department text).  
- [ ] Submit sends department_id only.  
- [ ] Edit prefill uses employee.department_id.  
- [ ] Dropdown options are from departments table (id + name).

---

## Part 6: Employees list page

**Goal:** List and filter use **department_id**; display shows department **name**.

### 6.1 Filter

- Department filter **options:** Use **useDepartments()** from `@/lib/api/department` (list of all departments).
- Filter **value:** Store **department_id** (e.g. state like `departmentFilter: string | "all"` where `"all"` means no filter, otherwise it’s a department id).
- When building the request (or API params), pass **department_id** (or equivalent) to the employees API; the API should filter with `employees.department_id = :id` when not “all”.

### 6.2 Employees API filter

- In **lib/api/employees.ts**, **fetchEmployees** (or equivalent) should accept a filter like `department_id?: string`.  
  - If present, add `.eq("department_id", department_id)` to the query.  
  - Remove any filter that was based on the old `department` text column.

### 6.3 Table display

- When rendering the employees table, show **department name**, not id:
  - If the API returns a joined **departments** object (from part 3), use `employee.departments?.name ?? "—"` (or the alias you chose, e.g. `department.name`).
  - If the API returns only **department_id**, either:
    - Add the join in the API (recommended), or  
    - Resolve name in the UI from `useDepartments()` by matching `department_id` to the list.

**Checklist part 6:**  
- [ ] Department filter options from useDepartments (department API).  
- [ ] Filter value is department_id; “all” means no filter.  
- [ ] fetchEmployees filters by department_id when provided.  
- [ ] Table shows department name (from join or lookup).

---

## Part 7: Anywhere else (employee.department)

**Goal:** No remaining references to the old **employee.department** text field.

### 7.1 Search codebase

- Search the repo for:
  - `employee.department` or `emp.department`
  - `department` on employee types (e.g. in types, or in components that assume a `department` string on employee).
- Replace with:
  - **Filtering / API:** use **department_id**.
  - **Display:** use department **name** from the joined `departments` object or from a lookup (e.g. `useDepartments()` + find by id).

### 7.2 Places to check

- **Dashboard:** Any employee or department stats or lists.  
- **Reports / exports:** Any column or filter that used “department” (switch to department_id for filter, name for display).  
- **Fixed assets / other modules:** If they show “assigned to” or department, use the new shape (department_id + resolved name).  
- **Salary / expenses:** Only if they reference employee department; usually they don’t, but worth a quick grep.

### 7.3 Optional cleanup

- **lib/api/settings.ts:** If you no longer use “predefined departments” from app_settings (key `departments`), you can remove or simplify that code (e.g. remove fetchPredefinedDepartments / updatePredefinedDepartments and their hooks if unused). Keep the file if you still use app_settings for other keys (e.g. HR email).

**Checklist part 7:**  
- [ ] No remaining references to employee.department (text).  
- [ ] All display uses department name (from join or lookup).  
- [ ] Optional: remove unused settings API code for departments JSON.

---

## Order of work

Do them in order: **3 → 4 → 5 → 6 → 7**. Each part builds on the previous. After part 7, the departments table is the only source of truth and the migration is complete.
