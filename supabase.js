// supabase.js
(function() {
    'use strict';
    const SUPABASE_URL = 'https://ntigrmbmrswvjuplrwzv.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_expC8oZfAx-N3iXKrVFlNg_7qXaRaPz';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    async function getCurrentUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    }

    async function signUp(email, password, username) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({ id: data.user.id, username });
        if (profileError) throw profileError;
        return data.user;
    }
    async function signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data.user;
    }
    async function signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }
    async function saveBirthData(userId, name, birthInfo) {
        const { solarYear, solarMonth, solarDay, hourIndex, gender } = birthInfo;
        const { error } = await supabase
            .from('birth_data')
            .insert({
                user_id: userId,
                name: name.trim(),
                solar_year: solarYear,
                solar_month: solarMonth,
                solar_day: solarDay,
                hour_index: hourIndex,
                gender: gender
            });
        if (error) throw error;
    }

    async function loadBirthList(userId) {
        const { data, error } = await supabase
            .from('birth_data')
            .select('id, name, solar_year, solar_month, solar_day, hour_index, gender')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }
    async function deleteBirthData(userId, id) {
        const { error } = await supabase
            .from('birth_data')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);
        if (error) throw error;
    }
    window.SupabaseClient = {
        getCurrentUser,
        signUp,
        signIn,
        signOut,
        saveBirthData,
        loadBirthList,
        deleteBirthData
    };
})();