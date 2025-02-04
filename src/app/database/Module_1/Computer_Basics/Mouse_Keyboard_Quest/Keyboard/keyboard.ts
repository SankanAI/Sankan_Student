import { SupabaseClient } from '@supabase/supabase-js';
import { KeyboardRecord } from '@/app/database/Module_1/Computer_Basics/Mouse_Keyboard_Quest/constant';

export async function initializeProgressRecord(
  supabase: SupabaseClient,
  studentId: string
) {
  try {
    const { data: computerBasicsData, error: computerBasicsError } = await supabase
      .from('computer_basics')
      .select('id')
      .eq('student_id', studentId)
      .single();

    if (computerBasicsError || !computerBasicsData) {
      return { error: 'Computer basics record not found' };
    }

    const { data: questData } = await supabase
      .from('mouse_keyboard_quest')
      .select('id')
      .eq('computer_basics_id', computerBasicsData.id)
      .eq('student_id', studentId)
      .single();

    const { data: existingRecord } = await supabase
      .from('keyboard')
      .select('*')
      .eq('mouse_keyboard_quest_id', questData?.id)
      .eq('student_id', studentId)
      .single();

    if (existingRecord) {
      return { data: existingRecord };
    }

    const { data: newRecord, error: insertError } = await supabase
      .from('keyboard')
      .insert([{
        mouse_keyboard_quest_id: questData?.id,
        student_id: studentId,
        level1_score: null,
        level1_time: null,
        level2_score: null,
        level2_time: null,
        level3_score: null,
        level3_time: null,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (insertError) throw insertError;
    return { data: newRecord };
  } catch (error) {
    return { error };
  }
}

export async function updateProgressRecord(
  supabase: SupabaseClient,
  record: KeyboardRecord,
  updates: Partial<KeyboardRecord>
) {
  try {
    const { error } = await supabase
      .from('keyboard')
      .update(updates)
      .eq('keyboard_id', record.keyboard_id);

    if (error) throw error;

    if (updates.completed) {
      const { error: questError } = await supabase
        .from('mouse_keyboard_quest')
        .update({
          completed_at: new Date().toISOString(),
          last_activity: new Date().toISOString()
        })
        .eq('id', record.mouse_keyboard_quest_id);

      if (questError) throw questError;
    }

    return { success: true };
  } catch (error) {
    return { error };
  }
}

export async function checkKeyboardCompletion(
  supabase: SupabaseClient,
  studentId: string
) {
  try {
    const { data, error } = await supabase
      .from('keyboard')
      .select('completed')
      .eq('student_id', studentId)
      .single();

    if (error) throw error;
    return { data };
  } catch (error) {
    return { error };
  }
}