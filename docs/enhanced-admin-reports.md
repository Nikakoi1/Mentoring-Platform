# Enhanced Admin Reports Dashboard

## Overview

The enhanced admin reports dashboard provides comprehensive analytics and insights for coordinators to monitor mentoring program effectiveness. It features detailed mentor-mentee analytics, filtering capabilities, and an accordion-style interface for hierarchical data exploration.

## Features

### 1. Reporting Period Filters
- **Date Range Selection**: Choose custom start and end dates for analysis
- **Default Period**: Automatically set to current month (from 1st to today)
- **Use Filters Action**: Changes are staged locally and only applied when the user clicks **Use Filters**, preventing accidental refreshes
- **Flexible Filtering**: Analyze specific time periods or trends

### 2. Mentor Multi-Selection
- **Searchable Multi-Select**: Focus-triggered search input opens a dropdown list of mentors with checkboxes
- **Selected Chips**: Added badges under the field so coordinators can review which mentors are currently staged for filtering
- **Use Filters Workflow**: Changes take effect only after clicking **Use Filters**, allowing users to queue up selections before refreshing data
- **All Mentors Option**: Leave selection empty to view aggregate analytics

### 3. Hierarchical Accordion Interface

#### Level 1: Mentor Overview
- **Mentor Information**: Name and email
- **Key Metrics**:
  - Total number of mentees
  - Total sessions conducted
  - Average evaluation scores
  - Goals achieved/total goals ratio

#### Level 2: Mentee Details (expanded under each mentor)
- **Mentee Information**: Name, email, and status
- **Performance Metrics**:
  - Session count (total, completed, planned)
  - Average evaluation ratings
  - Goals progress

#### Level 3: Session Details (expanded under each mentee)
- **Session Information**:
  - Title and scheduled time
  - Status (completed, planned, cancelled)
  - Evaluation ratings and comments
  - Goals worked on during session
  - Resources shared

### 4. Summary Cards
- **Total Users**: Aggregate mentee count across selected mentors
- **Active Pairings**: Number of active mentor-mentee relationships
- **Sessions This Month**: Total sessions conducted in the filtered period
- **Average Rating**: Overall session evaluation average

### 5. Excel Export (Implemented)
- **Workbook Generation**: Uses the `xlsx` library to create a multi-sheet workbook containing mentor summaries, mentee breakdowns, and applied filter metadata
- **Filter-Aware Exports**: Sheets respect the currently applied date range and mentor selections
- **Download Naming**: Files follow the pattern `mentor-analytics-<start>-to-<end>.xlsx` for traceability

## Database Functions

### `get_detailed_mentor_analytics`
Retrieves comprehensive analytics for mentors with optional filtering.

**Parameters:**
- `start_date` (optional): Filter sessions from this date
- `end_date` (optional): Filter sessions until this date  
- `mentor_ids` (optional): Array of mentor UUIDs to analyze

**Returns:**
- Mentor statistics and embedded mentee details
- Session counts, evaluations, and goals progress
- JSON-formatted mentee breakdown for each mentor

### `get_mentee_session_details`
Fetches detailed session information for a specific mentee.

**Parameters:**
- `mentee_id`: UUID of the mentee
- `start_date` (optional): Filter sessions from this date
- `end_date` (optional): Filter sessions until this date

**Returns:**
- Session details with evaluations and goals
- Resources shared during sessions
- Chronological session history

### `get_all_mentors`
Retrieves all mentor users for the filter dropdown.

**Returns:**
- Array of mentor objects with id, full_name, and email

## Frontend Components

### ReportingDashboard Component
**Location**: `src/components/admin/ReportingDashboard.tsx`

**Key Features:**
- State management for filters and expanded sections
- Dynamic data fetching based on filter changes
- Lazy loading of session details (only when mentee is expanded)
- Responsive design with mobile support

**State Management:**
- `analytics`: Mentor analytics data
- `expandedMentors`: Set of expanded mentor IDs
- `expandedMentees`: Set of expanded mentee IDs
- `menteeSessions`: Cached session details per mentee
- Filter states for dates and selected mentors

## Translation Support

### Namespace: `admin.reports`

**Translation Keys:**
- Filter labels and controls
- Metric descriptions and headers
- Status indicators and messages
- Session detail fields
- Error messages and loading states

**Languages:**
- English (en): Primary language
- Georgian (ka): Bilingual support

## Usage Instructions

### Accessing Reports
1. Navigate to `/admin/reports`
2. Ensure user has coordinator role permissions

### Applying Filters
1. **Set Date Range**: Use start and end date pickers
2. **Select Mentors**: Choose multiple mentors from the dropdown
   - Hold Ctrl/Cmd for multiple selection
   - Leave empty for all mentors
3. **Clear Filters**: Reset to default current month view

### Exploring Data
1. **View Mentor Summary**: Click on any mentor to expand their details
2. **Examine Mentees**: Click on mentees to see their session history
3. **Session Details**: Expand mentees to view individual session information
4. **Navigation**: Use chevron icons to expand/collapse sections

### Data Interpretation
- **Color Coding**: Different colors for metrics (blue for users, green for active, etc.)
- **Status Indicators**: Translated status labels for sessions and pairings
- **Evaluation Scores**: Numeric ratings with "N/A" for missing data
- **Goals Progress**: Shows achieved/total ratio

## Performance Considerations

### Optimizations
- **Lazy Loading**: Session details fetched only when needed
- **Caching**: Mentee session data cached to avoid repeated requests
- **Efficient Queries**: Database functions optimized for hierarchical data

### Recommendations
- Limit date ranges for large datasets
- Use mentor selection to focus on specific users
- Consider pagination for very large session histories

## Future Enhancements

### Planned Features
1. **Excel Export**: Complete export functionality implementation
2. **Advanced Filters**: Add goal status, session type filters
3. **Visualizations**: Charts and graphs for trend analysis
4. **Printable Reports**: Formatted PDF report generation
5. **Email Notifications**: Automated report scheduling

### Potential Improvements
- Real-time data updates
- Comparative period analysis
- Mentor performance benchmarks
- Custom metric definitions

## Technical Notes

### Dependencies
- React hooks for state management
- Lucide icons for UI elements
- Supabase RPC for database functions
- Translation system for bilingual support

### Browser Compatibility
- Modern browsers with ES6+ support
- Responsive design works on mobile devices
- Requires JavaScript for interactive features

### Security
- Role-based access control (coordinator only)
- Server-side data validation
- SQL injection prevention through parameterized queries
