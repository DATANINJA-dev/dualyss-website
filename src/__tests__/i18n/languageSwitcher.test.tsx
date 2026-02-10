import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { locales, localeNames } from '@/lib/i18n/config';

// Mock the i18n navigation
const mockReplace = vi.fn();
vi.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
  usePathname: () => '/about',
}));

// Mock next-intl useLocale
let currentLocale = 'en';
vi.mock('next-intl', () => ({
  useLocale: () => currentLocale,
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    currentLocale = 'en';
  });

  describe('Rendering', () => {
    it('renders the language switcher button', () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('displays current locale', () => {
      render(<LanguageSwitcher />);

      // The text is 'en' in the DOM, CSS transforms it to uppercase visually
      const localeSpan = screen.getByText('en');
      expect(localeSpan).toBeInTheDocument();
      expect(localeSpan).toHaveClass('uppercase');
    });

    it('dropdown is closed by default', () => {
      render(<LanguageSwitcher />);

      // Menu items should not be visible initially
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('Dropdown functionality', () => {
    it('opens dropdown when button is clicked', () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Menu should now be visible
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('renders all 6 language options when open', () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Check all language names are displayed
      locales.forEach((locale) => {
        expect(screen.getByText(localeNames[locale])).toBeInTheDocument();
      });
    });

    it('displays correct number of language options', () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems).toHaveLength(6);
    });

    it('closes dropdown when clicking a language', () => {
      render(<LanguageSwitcher />);

      // Open dropdown
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Click a language
      const frenchOption = screen.getByText('Français');
      fireEvent.click(frenchOption);

      // Dropdown should be closed
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('Language selection', () => {
    it('calls router.replace when selecting a new language', () => {
      render(<LanguageSwitcher />);

      // Open dropdown
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Click French
      const frenchOption = screen.getByText('Français');
      fireEvent.click(frenchOption);

      expect(mockReplace).toHaveBeenCalledWith('/about', { locale: 'fr' });
    });

    it('calls router.replace with correct locale for each language', () => {
      const testCases = [
        { name: 'Español', locale: 'es' },
        { name: 'Deutsch', locale: 'de' },
        { name: 'Italiano', locale: 'it' },
        { name: 'Català', locale: 'ca' },
      ];

      testCases.forEach(({ name, locale }) => {
        mockReplace.mockClear();
        const { unmount } = render(<LanguageSwitcher />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        const option = screen.getByText(name);
        fireEvent.click(option);

        expect(mockReplace).toHaveBeenCalledWith('/about', { locale });

        unmount();
      });
    });
  });

  describe('Accessibility', () => {
    it('button has correct aria attributes when closed', () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-haspopup', 'true');
    });

    it('button has correct aria-expanded when open', () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('menu items have correct role', () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems).toHaveLength(6);
    });

    it('menu has correct aria-orientation', () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const menu = screen.getByRole('menu');
      expect(menu).toHaveAttribute('aria-orientation', 'vertical');
    });
  });

  describe('Visual state', () => {
    it('displays all supported languages', () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Français')).toBeInTheDocument();
      expect(screen.getByText('Español')).toBeInTheDocument();
      expect(screen.getByText('Deutsch')).toBeInTheDocument();
      expect(screen.getByText('Italiano')).toBeInTheDocument();
      expect(screen.getByText('Català')).toBeInTheDocument();
    });
  });
});
