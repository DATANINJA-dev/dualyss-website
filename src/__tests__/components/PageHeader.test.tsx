import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from '@/components/content/PageHeader';

describe('PageHeader', () => {
  it('renders title correctly', () => {
    render(<PageHeader title="Test Title" />);
    expect(screen.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<PageHeader title="Title" subtitle="Subtitle text" />);
    expect(screen.getByText('Subtitle text')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    render(<PageHeader title="Title Only" />);
    expect(screen.queryByText('subtitle')).not.toBeInTheDocument();
  });

  it('applies default variant styles', () => {
    const { container } = render(<PageHeader title="Default" />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-neutral-50');
  });

  it('applies dark variant styles', () => {
    const { container } = render(<PageHeader title="Dark" variant="dark" />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-primary-500');
  });

  it('applies gradient variant styles', () => {
    const { container } = render(<PageHeader title="Gradient" variant="gradient" />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-gradient-to-br');
  });

  it('accepts custom className', () => {
    const { container } = render(<PageHeader title="Custom" className="custom-class" />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('custom-class');
  });
});
