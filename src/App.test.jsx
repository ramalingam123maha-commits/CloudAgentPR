// Tests for the Task Manager App component
// Covers task management logic, UI rendering, state updates, and user interactions

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App Component', () => {
  // Render the App component before each test
  beforeEach(() => {
    render(<App />);
  });

  describe('Initial Render', () => {
    it('should display the app title and description', () => {
      expect(screen.getByText('Organize work with clarity.')).toBeInTheDocument();
      expect(screen.getByText(/Capture tasks, assign priorities/)).toBeInTheDocument();
    });

    it('should display the Task Management category badge', () => {
      expect(screen.getByText('Task management app')).toBeInTheDocument();
    });

    it('should render the "Add a task" form', () => {
      expect(screen.getByText('Add a task')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Finalize onboarding checklist/)).toBeInTheDocument();
    });

    it('should render the task list section', () => {
      expect(screen.getByText('Task list')).toBeInTheDocument();
      expect(screen.getByText(/Click a task to mark it complete/)).toBeInTheDocument();
    });
  });

  describe('Initial Tasks Display', () => {
    it('should display initial seed tasks', () => {
      expect(screen.getByText('Plan sprint tasks')).toBeInTheDocument();
      expect(screen.getByText('Review design mockups')).toBeInTheDocument();
      expect(screen.getByText('Prepare release notes')).toBeInTheDocument();
    });

    it('should show correct priorities for initial tasks', () => {
      // First task is High priority - appears twice (form select and task)
      expect(screen.getAllByText('High').length).toBeGreaterThanOrEqual(1);
      // Second task is Medium priority - appears in form select and in tasks
      expect(screen.getAllByText('Medium').length).toBeGreaterThanOrEqual(1);
      // Third task is Low priority
      expect(screen.getAllByText('Low').length).toBeGreaterThanOrEqual(1);
    });

    it('should show correct completion status for initial tasks', () => {
      // First task "Plan sprint tasks" should be completed
      const planSprintButton = screen.getByRole('button', { name: /Mark Plan sprint tasks complete/ });
      expect(planSprintButton.closest('button')).toHaveClass('border-cyan-400', 'bg-cyan-400');

      // Second and third tasks should not be completed
      const reviewDesignButton = screen.getByRole('button', { name: /Mark Review design mockups complete/ });
      expect(reviewDesignButton.closest('button')).toHaveClass('border-slate-500', 'bg-transparent');
    });

    it('should display task count "3 tasks" initially', () => {
      expect(screen.getByText('3 tasks')).toBeInTheDocument();
    });
  });

  describe('Stats Display', () => {
    it('should display stats labels', () => {
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
      expect(screen.getByText('Open')).toBeInTheDocument();
    });

    it('should show correct initial stat values', () => {
      const statValues = screen.getAllByText(/^[0-9]$/);
      // Total: 3, Done: 1, Open: 2
      expect(statValues[0]).toHaveTextContent('3'); // Total
      expect(statValues[1]).toHaveTextContent('1'); // Done
      expect(statValues[2]).toHaveTextContent('2'); // Open
    });
  });

  describe('Add Task Form', () => {
    it('should have priority dropdown defaulting to "Medium"', () => {
      const prioritySelect = screen.getByDisplayValue('Medium');
      expect(prioritySelect).toBeInTheDocument();
    });

    it('should have priority options: High, Medium, Low', () => {
      const prioritySelect = screen.getByDisplayValue('Medium');
      const options = prioritySelect.querySelectorAll('option');
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent('High');
      expect(options[1]).toHaveTextContent('Medium');
      expect(options[2]).toHaveTextContent('Low');
    });

    it('should have an "Add task" button', () => {
      expect(screen.getByRole('button', { name: 'Add task' })).toBeInTheDocument();
    });
  });

  describe('Adding Tasks', () => {
    it('should add a task with default priority when form is submitted', async () => {
      const titleInput = screen.getByPlaceholderText(/Finalize onboarding checklist/);
      const addButton = screen.getByRole('button', { name: 'Add task' });

      await userEvent.type(titleInput, 'New task');
      fireEvent.click(addButton);

      // Verify task was added
      expect(screen.getByText('New task')).toBeInTheDocument();
      // Verify title input was cleared
      expect(titleInput).toHaveValue('');
      // Verify count increased
      expect(screen.getByText('4 tasks')).toBeInTheDocument();
    });

    it('should add a task with selected priority', async () => {
      const titleInput = screen.getByPlaceholderText(/Finalize onboarding checklist/);
      const prioritySelect = screen.getByDisplayValue('Medium');
      const addButton = screen.getByRole('button', { name: 'Add task' });

      // Change priority to High
      fireEvent.change(prioritySelect, { target: { value: 'High' } });
      await userEvent.type(titleInput, 'High priority task');
      fireEvent.click(addButton);

      expect(screen.getByText('High priority task')).toBeInTheDocument();
      // Priority should be reset to Medium after submission
      expect(prioritySelect).toHaveValue('Medium');
    });

    it('should not add task if title is empty', async () => {
      const addButton = screen.getByRole('button', { name: 'Add task' });
      const initialCount = screen.getByText('3 tasks');

      fireEvent.click(addButton);

      // Task count should remain the same
      expect(initialCount).toHaveTextContent('3 tasks');
    });

    it('should not add task if title is only whitespace', async () => {
      const titleInput = screen.getByPlaceholderText(/Finalize onboarding checklist/);
      const addButton = screen.getByRole('button', { name: 'Add task' });

      await userEvent.type(titleInput, '   ');
      fireEvent.click(addButton);

      // Task count should still be 3
      expect(screen.getByText('3 tasks')).toBeInTheDocument();
    });

    it('should trim whitespace from task title', async () => {
      const titleInput = screen.getByPlaceholderText(/Finalize onboarding checklist/);
      const addButton = screen.getByRole('button', { name: 'Add task' });

      await userEvent.type(titleInput, '  Trimmed task  ');
      fireEvent.click(addButton);

      // Task should appear without leading/trailing whitespace
      expect(screen.getByText('Trimmed task')).toBeInTheDocument();
    });

    it('should prepend new tasks to the list', async () => {
      const titleInput = screen.getByPlaceholderText(/Finalize onboarding checklist/);
      const addButton = screen.getByRole('button', { name: 'Add task' });

      await userEvent.type(titleInput, 'First new task');
      fireEvent.click(addButton);

      // New task should appear before the initial tasks
      const tasks = screen.getAllByRole('article');
      expect(tasks[0]).toHaveTextContent('First new task');
      expect(tasks[1]).toHaveTextContent('Plan sprint tasks');
    });

    it('should reset priority to Medium after adding a task', async () => {
      const titleInput = screen.getByPlaceholderText(/Finalize onboarding checklist/);
      const prioritySelect = screen.getByDisplayValue('Medium');
      const addButton = screen.getByRole('button', { name: 'Add task' });

      // Change priority to Low
      fireEvent.change(prioritySelect, { target: { value: 'Low' } });
      expect(prioritySelect).toHaveValue('Low');

      // Add a task
      await userEvent.type(titleInput, 'Low priority task');
      fireEvent.click(addButton);

      // Priority should reset to Medium
      expect(prioritySelect).toHaveValue('Medium');
    });
  });

  describe('Toggle Task Completion', () => {
    it('should toggle a task from incomplete to complete', () => {
      // Find the button for "Review design mockups" (initially incomplete)
      const toggleButton = screen.getByRole('button', { name: /Mark Review design mockups complete/ });

      // Initially incomplete (outlined circle)
      expect(toggleButton).toHaveClass('border-slate-500');
      expect(toggleButton).not.toHaveClass('bg-cyan-400');

      // Click to mark complete
      fireEvent.click(toggleButton);

      // Should now be complete (filled circle)
      expect(toggleButton).toHaveClass('border-cyan-400', 'bg-cyan-400');
    });

    it('should toggle a task from complete to incomplete', () => {
      // Find the button for "Plan sprint tasks" (initially complete)
      const toggleButton = screen.getByRole('button', { name: /Mark Plan sprint tasks complete/ });

      // Initially complete
      expect(toggleButton).toHaveClass('border-cyan-400');

      // Click to mark incomplete
      fireEvent.click(toggleButton);

      // Should now be incomplete
      expect(toggleButton).not.toHaveClass('bg-cyan-400');
      expect(toggleButton).toHaveClass('border-slate-500');
    });

    it('should update stats when task completion status changes', () => {
      const toggleButton = screen.getByRole('button', { name: /Mark Review design mockups complete/ });

      // Initial: Total 3, Done 1, Open 2
      let statValues = screen.getAllByText(/^[0-9]$/);
      expect(statValues[0]).toHaveTextContent('3'); // Total
      expect(statValues[1]).toHaveTextContent('1'); // Done
      expect(statValues[2]).toHaveTextContent('2'); // Open

      // Toggle task to complete
      fireEvent.click(toggleButton);

      // Updated: Total 3, Done 2, Open 1
      statValues = screen.getAllByText(/^[0-9]$/);
      expect(statValues[0]).toHaveTextContent('3'); // Total
      expect(statValues[1]).toHaveTextContent('2'); // Done
      expect(statValues[2]).toHaveTextContent('1'); // Open
    });

    it('should show strikethrough text when task is completed', () => {
      const toggleButton = screen.getByRole('button', { name: /Mark Review design mockups complete/ });
      const taskTitle = screen.getByText('Review design mockups');

      // Initially not struck through
      expect(taskTitle).not.toHaveClass('line-through');

      fireEvent.click(toggleButton);

      // Should be struck through and muted
      expect(taskTitle).toHaveClass('line-through', 'text-slate-500');
    });

    it('should show "Completed" status label when task is completed', () => {
      const toggleButton = screen.getByRole('button', { name: /Mark Review design mockups complete/ });
      const article = toggleButton.closest('article');

      // Initially shows "In progress"
      expect(article).toHaveTextContent('In progress');

      fireEvent.click(toggleButton);

      // Should show "Completed"
      expect(article).toHaveTextContent('Completed');
      expect(article).not.toHaveTextContent('In progress');
    });
  });

  describe('Delete Task', () => {
    it('should remove a task when delete button is clicked', () => {
      const allDeleteButtons = screen.getAllByRole('button', { name: 'Delete' });
      const firstDeleteButton = allDeleteButtons[0]; // Delete button for "Plan sprint tasks"

      // Task should be in document
      expect(screen.getByText('Plan sprint tasks')).toBeInTheDocument();

      // Click delete
      fireEvent.click(firstDeleteButton);

      // Task should be removed
      expect(screen.queryByText('Plan sprint tasks')).not.toBeInTheDocument();
    });

    it('should update task count when task is deleted', () => {
      const deleteButton = screen.getAllByRole('button', { name: 'Delete' })[0];

      // Initial count: 3
      expect(screen.getByText('3 tasks')).toBeInTheDocument();

      fireEvent.click(deleteButton);

      // Count should be 2
      expect(screen.getByText('2 tasks')).toBeInTheDocument();
      expect(screen.queryByText('3 tasks')).not.toBeInTheDocument();
    });

    it('should update stats when task is deleted', () => {
      // Find and delete an incomplete task (e.g., "Review design mockups")
      const tasks = screen.getAllByRole('article');
      const reviewDesignArticle = Array.from(tasks).find(t => t.textContent.includes('Review design mockups'));
      const deleteButton = reviewDesignArticle.querySelector('button:last-child');

      // Initial: Total 3, Done 1, Open 2
      let statValues = screen.getAllByText(/^[0-9]$/);
      expect(statValues[1]).toHaveTextContent('1'); // Done
      expect(statValues[2]).toHaveTextContent('2'); // Open

      fireEvent.click(deleteButton);

      // Updated: Total 2, Done 1, Open 1
      statValues = screen.getAllByText(/^[0-9]$/);
      expect(statValues[0]).toHaveTextContent('2'); // Total
      expect(statValues[1]).toHaveTextContent('1'); // Done
      expect(statValues[2]).toHaveTextContent('1'); // Open
    });

    it('should delete only the selected task, not others', () => {
      const allDeleteButtons = screen.getAllByRole('button', { name: 'Delete' });
      const firstDeleteButton = allDeleteButtons[0];

      fireEvent.click(firstDeleteButton);

      // First task should be deleted
      expect(screen.queryByText('Plan sprint tasks')).not.toBeInTheDocument();
      // Other tasks should remain
      expect(screen.getByText('Review design mockups')).toBeInTheDocument();
      expect(screen.getByText('Prepare release notes')).toBeInTheDocument();
    });
  });

  describe('Stats Calculation', () => {
    it('should calculate correct stats after multiple operations', async () => {
      // Add a new task
      const titleInput = screen.getByPlaceholderText(/Finalize onboarding checklist/);
      const addButton = screen.getByRole('button', { name: 'Add task' });

      await userEvent.type(titleInput, 'New task');
      fireEvent.click(addButton);

      // Now: Total 4, Done 1, Open 3
      let statValues = screen.getAllByText(/^[0-9]$/);
      expect(statValues[0]).toHaveTextContent('4');
      expect(statValues[1]).toHaveTextContent('1');
      expect(statValues[2]).toHaveTextContent('3');

      // Toggle new task to complete
      const toggleButtons = screen.getAllByRole('button', { name: /Mark.*complete/ });
      fireEvent.click(toggleButtons[0]); // Toggle first task

      // Now: Total 4, Done 2, Open 2
      statValues = screen.getAllByText(/^[0-9]$/);
      expect(statValues[1]).toHaveTextContent('2');
      expect(statValues[2]).toHaveTextContent('2');
    });
  });

  describe('Priority Badges', () => {
    it('should display badges with priority styling', () => {
      // High priority - should have rose styling (in article context)
      const taskArticles = screen.getAllByRole('article');
      const hasHighBadge = taskArticles.some(article => article.textContent.includes('High'));
      expect(hasHighBadge).toBe(true);

      // Medium priority - should appear
      const hasMediumBadge = taskArticles.some(article => article.textContent.includes('Medium'));
      expect(hasMediumBadge).toBe(true);

      // Low priority - should appear
      const hasLowBadge = taskArticles.some(article => article.textContent.includes('Low'));
      expect(hasLowBadge).toBe(true);
    });
  });

  describe('Form Input Control', () => {
    it('should update title input value as user types', async () => {
      const titleInput = screen.getByPlaceholderText(/Finalize onboarding checklist/);

      await userEvent.type(titleInput, 'Test task');

      expect(titleInput).toHaveValue('Test task');
    });

    it('should clear title input when form is submitted', async () => {
      const titleInput = screen.getByPlaceholderText(/Finalize onboarding checklist/);
      const addButton = screen.getByRole('button', { name: 'Add task' });

      await userEvent.type(titleInput, 'Task to add');
      fireEvent.click(addButton);

      expect(titleInput).toHaveValue('');
    });

    it('should update priority dropdown value when changed', () => {
      const prioritySelect = screen.getByDisplayValue('Medium');

      fireEvent.change(prioritySelect, { target: { value: 'High' } });

      expect(prioritySelect).toHaveValue('High');

      fireEvent.change(prioritySelect, { target: { value: 'Low' } });

      expect(prioritySelect).toHaveValue('Low');
    });
  });

  describe('UI Accessibility', () => {
    it('should have descriptive aria-labels on toggle buttons', () => {
      const toggleButtons = screen.getAllByRole('button', { name: /Mark.*complete/ });

      toggleButtons.forEach((button) => {
        expect(button).toHaveAttribute('aria-label');
        expect(button.getAttribute('aria-label')).toMatch(/Mark .+ complete/);
      });
    });

    it('should have descriptive labels for form inputs', () => {
      const labels = screen.getAllByText('Task title');
      expect(labels.length).toBeGreaterThan(0);

      const priorityLabels = screen.getAllByText('Priority');
      expect(priorityLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Task List Empty State', () => {
    it('should show task count badge with current count', () => {
      expect(screen.getByText('3 tasks')).toBeInTheDocument();
    });
  });
});
