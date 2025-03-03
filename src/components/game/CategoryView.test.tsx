import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryView from './CategoryView';
import { CategoryWithNominees } from '@/types';

// Mock data for testing
const mockCategory: CategoryWithNominees = {
  id: 'cat-123',
  lobby_id: 'lobby-456',
  name: 'Best Picture',
  order: 1,
  locked: false,
  nominees: [
    {
      id: 'nom-1',
      category_id: 'cat-123',
      name: 'Movie 1',
      movie: 'Movie 1',
    },
    {
      id: 'nom-2',
      category_id: 'cat-123',
      name: 'Movie 2',
      movie: 'Movie 2',
    },
  ],
};

const lockedCategory: CategoryWithNominees = {
  ...mockCategory,
  locked: true,
};

describe('CategoryView', () => {
  it('should render category name', () => {
    render(
      <CategoryView
        category={mockCategory}
        onSelect={() => {}}
        onLockCategory={() => {}}
        onSetWinner={() => {}}
        isHost={false}
      />
    );
    
    expect(screen.getByText('Best Picture')).toBeInTheDocument();
  });
  
  it('should render nominees', () => {
    render(
      <CategoryView
        category={mockCategory}
        onSelect={() => {}}
        onLockCategory={() => {}}
        onSetWinner={() => {}}
        isHost={false}
      />
    );
    
    expect(screen.getAllByText('Movie 1')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Movie 2')[0]).toBeInTheDocument();
  });
  
  it('should call onSelect when nominee is clicked', () => {
    const onSelectMock = vi.fn();
    
    render(
      <CategoryView
        category={mockCategory}
        onSelect={onSelectMock}
        onLockCategory={() => {}}
        onSetWinner={() => {}}
        isHost={false}
      />
    );
    
    fireEvent.click(screen.getAllByText('Movie 1')[0].closest('.cursor-pointer')!);
    expect(onSelectMock).toHaveBeenCalledWith('nom-1');
  });
  
  it('should not call onSelect when nominee is clicked if category is locked', () => {
    const onSelectMock = vi.fn();
    
    render(
      <CategoryView
        category={lockedCategory}
        onSelect={onSelectMock}
        onLockCategory={() => {}}
        onSetWinner={() => {}}
        isHost={false}
      />
    );
    
    fireEvent.click(screen.getAllByText('Movie 1')[0].closest('.cursor-pointer')!);
    expect(onSelectMock).not.toHaveBeenCalled();
  });
  
  it('should show host controls when isHost is true', () => {
    render(
      <CategoryView
        category={mockCategory}
        onSelect={() => {}}
        onLockCategory={() => {}}
        onSetWinner={() => {}}
        isHost={true}
      />
    );
    
    expect(screen.getByText('Lock Voting')).toBeInTheDocument();
  });
});