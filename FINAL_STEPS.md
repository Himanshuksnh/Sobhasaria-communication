# Final Implementation Steps - EXACT CODE

## ✅ Already Done:
1. Props added: `group`, `userEmail`
2. State added: `leaders`, `isTeacher`, `activeTab`
3. Teacher check logic added
4. `loadLeadersData()` function added
5. `handleSaveLeaders()` function added
6. Tabs imported

## 🔧 Remaining: Wrap UI in Tabs

### Step 1: Find line ~380 in attendance-table.tsx
Look for: `return (`

### Step 2: Replace the return statement structure

**BEFORE:**
```tsx
return (
  <div className="space-y-4 sm:space-y-6">
    {/* Branch Filter & Search */}
    <Card className="p-3 sm:p-4">
      ...existing UI...
    </Card>
    ...rest of UI...
  </div>
);
```

**AFTER:**
```tsx
return (
  <div className="space-y-4 sm:space-y-6">
    {isTeacher ? (
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'students' | 'leaders')}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="leaders">Leaders</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          {/* ALL EXISTING UI GOES HERE - just indent it */}
          <Card className="p-3 sm:p-4">
            ...existing UI...
          </Card>
          ...rest of existing UI...
        </TabsContent>

        <TabsContent value="leaders">
          {/* COPY-PASTE Students UI and replace students with leaders */}
          <Card className="p-3 sm:p-4">
            <div className="flex flex-col gap-3">
              {availableBranches.length > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <label className="text-sm font-medium">Filter by Branch:</label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Branches</SelectItem>
                      {availableBranches.map((branch) => (
                        <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </Card>

          {/* Leaders Table - Copy student table structure */}
          <Card className="p-4 sm:p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Roll No</th>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Branch</th>
                    <th className="text-center p-3">Status</th>
                    <th className="text-center p-3">Attendance (0-5)</th>
                    <th className="text-center p-3">Judge (0-5)</th>
                    <th className="text-center p-3">Total</th>
                    <th className="text-center p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map((leader) => (
                    <tr key={leader.email} className="border-b">
                      <td className="p-3">{leader.rollNo}</td>
                      <td className="p-3">{leader.name}</td>
                      <td className="p-3">{leader.branch}</td>
                      <td className="p-3 text-center">
                        <select
                          value={leader.status}
                          onChange={(e) => {
                            const updated = leaders.map(l =>
                              l.email === leader.email ? {...l, status: e.target.value} : l
                            );
                            setLeaders(updated);
                          }}
                          className="px-2 py-1 border rounded"
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        <Input
                          type="number"
                          min="0"
                          max="5"
                          value={leader.attendanceMarks}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(5, Number(e.target.value)));
                            const updated = leaders.map(l =>
                              l.email === leader.email ? {
                                ...l,
                                attendanceMarks: val,
                                totalMarks: val + l.judgeMarks,
                                status: val > 0 ? 'present' : l.status
                              } : l
                            );
                            setLeaders(updated);
                          }}
                          className="w-20 text-center"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <Input
                          type="number"
                          min="0"
                          max="5"
                          value={leader.judgeMarks}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(5, Number(e.target.value)));
                            const updated = leaders.map(l =>
                              l.email === leader.email ? {
                                ...l,
                                judgeMarks: val,
                                totalMarks: l.attendanceMarks + val,
                                status: val > 0 ? 'present' : l.status
                              } : l
                            );
                            setLeaders(updated);
                          }}
                          className="w-20 text-center"
                        />
                      </td>
                      <td className="p-3 text-center font-bold">{leader.totalMarks}</td>
                      <td className="p-3 text-center">
                        <span className="text-sm text-muted-foreground">{leader.email}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <Button onClick={handleSaveLeaders} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Leader Attendance'}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    ) : (
      /* If not teacher, show only students (existing UI without tabs) */
      <>
        {/* ALL EXISTING UI - no changes */}
      </>
    )}
  </div>
);
```

## 🎯 Quick Summary:
1. Wrap existing UI in `<TabsContent value="students">`
2. Add `<TabsContent value="leaders">` with similar UI
3. Replace `students` with `leaders` in the new tab
4. Replace `handleSave` with `handleSaveLeaders`
5. If not teacher, show existing UI without tabs

## ⚠️ Important:
- Don't delete any existing code
- Just wrap it in Tabs
- Leaders tab is a copy of students tab with variable names changed
- Test with teacher email: himanshunokhval@gmail.com
