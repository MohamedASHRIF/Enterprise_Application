package com.enterprice.notification_system.Repository;

import com.enterprice.notification_system.Entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    Optional<ChatRoom> findByCustomerEmail(String customerEmail);

    Optional<ChatRoom> findByRoomId(String roomId);

    List<ChatRoom> findByActiveTrue();
}
