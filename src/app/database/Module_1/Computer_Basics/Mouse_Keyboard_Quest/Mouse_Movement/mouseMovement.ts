// src/lib/database/mouseMovement.ts

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export type MouseRecord = {
  id: string;
  mouse_keyboard_quest_id: string;
  student_id: string;
  click_completed: boolean;
  dblclick_completed: boolean;
  context_menu_completed: boolean;
  mouse_over_completed: boolean;
  completed: boolean;
  started_at: string;
  completed_at: string | null;
  last_activity: string;
};

export type EventStats = {
  [key: string]: number;
};
//local
export class MouseMovementDB {
  private supabase = createClientComponentClient();

  async updateProgress(stats: EventStats, progressRecord: MouseRecord, userId: string) {
    if (!progressRecord || !userId) return;

    const updates: Partial<MouseRecord> = {
      click_completed: stats.click > 0,
      dblclick_completed: stats.dblclick > 0,
      context_menu_completed: stats.contextmenu > 0,
      mouse_over_completed: stats.mouseover > 0,
      last_activity: new Date().toISOString()
    };

    const allCompleted = Object.values(stats).every(count => count > 0);
    if (allCompleted) {
      updates.completed = true;
      updates.completed_at = new Date().toISOString();
    }

    try {
      const { error } = await this.supabase
        .from('mouse_movement')
        .update(updates)
        .eq('id', progressRecord.id);

      if (error) throw error;

      if (allCompleted) {
        const { error: questError } = await this.supabase
          .from('mouse_keyboard_quest')
          .update({
            completed_at: new Date().toISOString(),
            last_activity: new Date().toISOString()
          })
          .eq('id', progressRecord.mouse_keyboard_quest_id);

        if (questError) throw questError;
      }
    } catch (error) {
      console.log('Error updating progress:', error);
      throw error;
    }
  }

  async initializeProgressRecord(studentId: string) {
    try {
      // Check for existing computer_basics record
      let { data: computerBasicsData } = await this.supabase
        .from('computer_basics')
        .select('id')
        .eq('student_id', studentId)
        .single();

      // Create computer_basics record if it doesn't exist
      if (!computerBasicsData) {
        const { data: newComputerBasics, error: computerBasicsError } = await this.supabase
          .from('computer_basics')
          .insert([{
            student_id: studentId,
            started_at: new Date().toISOString(),
            last_activity: new Date().toISOString()
          }])
          .select()
          .single();

        if (computerBasicsError) throw computerBasicsError;
        computerBasicsData = newComputerBasics;
      }

      // Check for existing mouse_keyboard_quest record
      let { data: questData } = await this.supabase
        .from('mouse_keyboard_quest')
        .select('id')
        .eq('computer_basics_id', computerBasicsData?.id)
        .eq('student_id', studentId)
        .single();

      // Create mouse_keyboard_quest record if it doesn't exist
      if (!questData) {
        const { data: newQuest, error: questError } = await this.supabase
          .from('mouse_keyboard_quest')
          .insert([{
            computer_basics_id: computerBasicsData?.id,
            student_id: studentId,
            started_at: new Date().toISOString(),
            last_activity: new Date().toISOString()
          }])
          .select()
          .single();

        if (questError) throw questError;
        questData = newQuest;
      }

      // Check for existing mouse_movement record
      const { data: existingRecord } = await this.supabase
        .from('mouse_movement')
        .select('*')
        .eq('mouse_keyboard_quest_id', questData?.id)
        .eq('student_id', studentId)
        .single();

      if (existingRecord) {
        return existingRecord;
      }

      // Create new mouse_movement record
      const { data: newRecord, error: movementError } = await this.supabase
        .from('mouse_movement')
        .insert([{
          mouse_keyboard_quest_id: questData?.id,
          student_id: studentId,
          started_at: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          click_completed: false,
          dblclick_completed: false,
          context_menu_completed: false,
          mouse_over_completed: false,
          completed: false
        }])
        .select()
        .single();

      if (movementError) throw movementError;
      return newRecord;
    } catch (error) {
      console.log('Error initializing progress record:', error);
      throw error;
    }
  }

  async checkCompletion(studentId: string) {
    try {
      const { data, error } = await this.supabase
        .from('mouse_movement')
        .select('completed')
        .eq('student_id', studentId)
        .single();

      if (error) throw error;
      return data?.completed || false;
    } catch (error) {
      console.log('Error checking completion status:', error);
      throw error;
    }
  }
}