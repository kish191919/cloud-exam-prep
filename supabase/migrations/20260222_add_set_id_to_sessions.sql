-- exam_sessions에 set_id 컬럼 추가 (어느 세트에서 시험을 봤는지 추적)
ALTER TABLE exam_sessions
  ADD COLUMN IF NOT EXISTS set_id UUID REFERENCES exam_sets(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_exam_sessions_set_id ON exam_sessions(set_id);
