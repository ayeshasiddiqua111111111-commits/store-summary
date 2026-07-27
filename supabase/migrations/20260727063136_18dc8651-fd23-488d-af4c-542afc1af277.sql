
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  item TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales TO anon, authenticated;
GRANT ALL ON public.sales TO service_role;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read sales" ON public.sales FOR SELECT USING (true);
CREATE POLICY "Public can insert sales" ON public.sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update sales" ON public.sales FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete sales" ON public.sales FOR DELETE USING (true);

CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO anon, authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Public can insert expenses" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update expenses" ON public.expenses FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete expenses" ON public.expenses FOR DELETE USING (true);
