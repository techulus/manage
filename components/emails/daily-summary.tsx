import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface Task {
  id: number;
  name: string;
  dueDate: Date | null;
  taskList: {
    id: number;
    name: string;
    status: string;
    project: {
      id: number;
      name: string;
    };
  };
}

interface Event {
  id: number;
  name: string;
  description: string | null;
  start: Date;
  end: Date | null;
  allDay: boolean;
  project: {
    id: number;
    name: string;
  };
}

interface DailySummaryProps {
  firstName?: string;
  email: string;
  timezone: string;
  date: Date;
  overdueTasks: Task[];
  dueToday: Task[];
  events: Event[];
}

export const DailySummary = ({
  firstName,
  email,
  timezone,
  date,
  overdueTasks,
  dueToday,
  events,
}: DailySummaryProps) => {
  const formattedDate = getFormattedDate(date, timezone);
  const totalTasks = overdueTasks.length + dueToday.length;
  
  const previewText = `Daily Summary for ${formattedDate} - ${totalTasks} tasks, ${events.length} events`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Daily Summary</Heading>
            <Text style={dateText}>{formattedDate}</Text>
          </Section>
          
          <Section style={content}>
            <Text style={greeting}>
              🌅 Good morning {firstName || 'there'}!
            </Text>
            
            <Text style={text}>
              📅 Here's what's on your agenda today:
            </Text>

            {/* Overdue Tasks Section */}
            {overdueTasks.length > 0 && (
              <Section style={sectionStyle}>
                <Heading style={h2}>
                  🚨 Overdue Tasks ({overdueTasks.length})
                </Heading>
                {overdueTasks.map((task) => (
                  <div key={task.id} style={taskItem}>
                    <Text style={taskName}>{task.name}</Text>
                    <Text style={taskMeta}>
                      {task.taskList.project.name} • {task.taskList.name}
                      {task.dueDate && (
                        <span style={overdueDate}>
                          {' • Due: '}{formatTaskDate(task.dueDate, timezone)}
                        </span>
                      )}
                    </Text>
                  </div>
                ))}
              </Section>
            )}

            {/* Due Today Tasks Section */}
            {dueToday.length > 0 && (
              <Section style={sectionStyle}>
                <Heading style={h2}>
                  📋 Due Today ({dueToday.length})
                </Heading>
                {dueToday.map((task) => (
                  <div key={task.id} style={taskItem}>
                    <Text style={taskName}>{task.name}</Text>
                    <Text style={taskMeta}>
                      {task.taskList.project.name} • {task.taskList.name}
                    </Text>
                  </div>
                ))}
              </Section>
            )}

            {/* Events Section */}
            {events.length > 0 && (
              <Section style={sectionStyle}>
                <Heading style={h2}>
                  📅 Today's Events ({events.length})
                </Heading>
                {events.map((event) => (
                  <div key={event.id} style={eventItem}>
                    <Text style={eventName}>{event.name}</Text>
                    <Text style={eventMeta}>
                      {event.project.name}
                      {!event.allDay && (
                        <span>
                          {' • '}{formatEventTime(event.start, event.end, timezone)}
                        </span>
                      )}
                      {event.allDay && <span> • All Day</span>}
                    </Text>
                    {event.description && (
                      <Text style={eventDescription}>{event.description}</Text>
                    )}
                  </div>
                ))}
              </Section>
            )}
            
            <Section style={buttonContainer}>
              <Button style={button} href="https://managee.xyz/start">
                Open Manage
              </Button>
            </Section>
            
            <Text style={footer}>
              ✨ Have a productive day! 🚀<br />
              The Manage Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

function getFormattedDate(date: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch (error) {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }
}

function formatTaskDate(date: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch (error) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  }
}

function formatEventTime(start: Date, end: Date | null, timezone: string): string {
  try {
    const startTime = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit'
    }).format(start);
    
    if (!end) return startTime;
    
    const endTime = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit'
    }).format(end);
    
    return `${startTime} - ${endTime}`;
  } catch (error) {
    const startTime = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    }).format(start);
    
    if (!end) return startTime;
    
    const endTime = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    }).format(end);
    
    return `${startTime} - ${endTime}`;
  }
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  padding: '32px 24px 24px',
  borderBottom: '1px solid #e6ebf1',
  textAlign: 'center' as const,
};

const content = {
  padding: '24px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: '600',
  lineHeight: '36px',
  margin: '0 0 8px',
};

const h2 = {
  color: '#374151',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '0 0 16px',
};

const dateText = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
};

const greeting = {
  color: '#374151',
  fontSize: '18px',
  fontWeight: '500',
  lineHeight: '28px',
  margin: '0 0 16px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const sectionStyle = {
  margin: '32px 0',
  padding: '20px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
};

const taskItem = {
  marginBottom: '16px',
  paddingLeft: '12px',
  borderLeft: '3px solid hsl(142.1, 76.2%, 36.3%)',
};

const taskName = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: '500',
  lineHeight: '24px',
  margin: '0 0 4px',
};

const taskMeta = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const overdueDate = {
  color: '#dc2626',
  fontWeight: '500',
};

const eventItem = {
  marginBottom: '16px',
  paddingLeft: '12px',
  borderLeft: '3px solid #3b82f6',
};

const eventName = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: '500',
  lineHeight: '24px',
  margin: '0 0 4px',
};

const eventMeta = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px',
};

const eventDescription = {
  color: '#4b5563',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
  fontStyle: 'italic',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: 'hsl(142.1, 76.2%, 36.3%)',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px 0 0',
  textAlign: 'center' as const,
};

export function dailySummaryPlainText({
  firstName,
  email,
  timezone,
  date,
  overdueTasks,
  dueToday,
  events,
}: DailySummaryProps): string {
  const formattedDate = getFormattedDate(date, timezone);
  
  let content = `Daily Summary - ${formattedDate}

🌅 Good morning ${firstName || 'there'}!

📅 Here's what's on your agenda today:

`;

  // Overdue Tasks
  if (overdueTasks.length > 0) {
    content += `🚨 OVERDUE TASKS (${overdueTasks.length})
${'-'.repeat(30)}
`;
    for (const task of overdueTasks) {
      content += `• ${task.name}\n`;
      content += `  ${task.taskList.project.name} • ${task.taskList.name}`;
      if (task.dueDate) {
        content += ` • Due: ${formatTaskDate(task.dueDate, timezone)}`;
      }
      content += '\n\n';
    }
    content += '\n';
  }

  // Due Today Tasks
  if (dueToday.length > 0) {
    content += `📋 DUE TODAY (${dueToday.length})
${'-'.repeat(30)}
`;
    for (const task of dueToday) {
      content += `• ${task.name}\n`;
      content += `  ${task.taskList.project.name} • ${task.taskList.name}\n\n`;
    }
    content += '\n';
  }

  // Events
  if (events.length > 0) {
    content += `📅 TODAY'S EVENTS (${events.length})
${'-'.repeat(30)}
`;
    for (const event of events) {
      content += `• ${event.name}\n`;
      content += `  ${event.project.name}`;
      if (!event.allDay) {
        content += ` • ${formatEventTime(event.start, event.end, timezone)}`;
      } else {
        content += ' • All Day';
      }
      if (event.description) {
        content += `\n  ${event.description}`;
      }
      content += '\n\n';
    }
  }

  content += `
Open Manage: https://managee.xyz/start

✨ Have a productive day! 🚀
The Manage Team`;

  return content;
}

export { getFormattedDate };

export default DailySummary;