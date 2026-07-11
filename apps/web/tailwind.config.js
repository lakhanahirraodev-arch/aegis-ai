/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: {
          DEFAULT: "var(--border-default)",
          subtle: "var(--border-subtle)",
          focus: "var(--border-focus)",
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        surface: {
          canvas: "var(--surface-canvas)",
          sidebar: "var(--surface-sidebar)",
          card: "var(--surface-card)",
          hover: "var(--surface-hover)",
          elevated: "var(--surface-elevated)",
        },

        accent: {
          DEFAULT: "var(--color-brand-primary)",
          hover: "var(--color-brand-hover)",
          pressed: "var(--color-brand-pressed)",
          tint: "var(--color-brand-tint)",
        },

        ai: {
          accent: "var(--color-ai-accent)",
          surface: "var(--color-ai-surface)",
        },

        status: {
          green: {
            DEFAULT: "var(--color-success)",
            bg: "var(--color-success-bg)",
          },
          amber: {
            DEFAULT: "var(--color-warning)",
            bg: "var(--color-warning-bg)",
          },
          red: {
            DEFAULT: "var(--color-danger)",
            bg: "var(--color-danger-bg)",
          },
          blue: {
            DEFAULT: "var(--color-info)",
            bg: "var(--color-info-bg)",
          },
        },

        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
          disabled: "var(--color-text-disabled)",
        },

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        xl: "1rem", // 16px
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontSize: {
        // Spec typography scale mapping:
        hero: ["32px", { lineHeight: "40px", letterSpacing: "-0.02em" }],
        title: ["28px", { lineHeight: "36px", letterSpacing: "-0.015em" }],
        section: ["20px", { lineHeight: "28px", letterSpacing: "-0.01em" }],
        "card-title": ["16px", { lineHeight: "24px" }],
        body: ["15px", { lineHeight: "22px" }],
        metadata: ["13px", { lineHeight: "18px" }],
        "sidebar-label": ["15px", { lineHeight: "20px" }],
        button: ["15px", { lineHeight: "20px" }],
        number: ["36px", { lineHeight: "44px", letterSpacing: "-0.025em" }],

        xxs: "11px",
        xs: "12px",
        sm: "13px",
        md: "14px",
        lg: "18px",
        xl: "24px",
      },
    },
  },
  plugins: [],
};
