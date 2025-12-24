import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Minus, MoreVertical, Paperclip, Users, UserPlus, CheckCircle, Search, FileText } from 'lucide-react';
import { ChatContact, ChatMessage } from '../types';

// Giả lập người dùng hiện tại đang đăng nhập (Là Admin)
const CURRENT_USER = {
  id: 'me',
  name: 'Đinh Phạm Diệu Tín',
  isAdmin: true 
};

// Loại bỏ AI khỏi danh sách, chỉ giữ nhân viên
const INITIAL_CONTACTS: ChatContact[] = [
  { id: '1', name: 'Nguyễn Văn An', avatar: 'https://picsum.photos/id/1012/100/100', type: 'user', isOnline: true, role: 'Trưởng phòng IT' },
  { id: '2', name: 'Trần Thị Bích', avatar: 'https://picsum.photos/id/1027/100/100', type: 'user', isOnline: false, role: 'Kế toán' },
  { id: '3', name: 'Lê Hoàng Nam', avatar: 'https://picsum.photos/id/1005/100/100', type: 'user', isOnline: true, role: 'DevOps' },
  { id: '4', name: 'Phòng Marketing', avatar: 'https://ui-avatars.com/api/?name=MKT&background=ff6b00&color=fff', type: 'group', members: ['me', '1', '2'], isOnline: true, role: '3 thành viên' },
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  '1': [
    { id: 'm2', senderId: '1', text: 'Chào em, chiều nay họp lúc mấy giờ nhỉ?', timestamp: new Date(Date.now() - 3600000), isMe: false }
  ],
  '4': [
    { id: 'g1', senderId: '1', senderName: 'Nguyễn Văn An', text: 'Mọi người nộp báo cáo chưa?', timestamp: new Date(Date.now() - 7200000), isMe: false },
    { id: 'g2', senderId: '2', senderName: 'Trần Thị Bích', text: 'Em gửi rồi nhé anh.', timestamp: new Date(Date.now() - 7000000), isMe: false },
  ]
};

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  
  const [contacts, setContacts] = useState<ChatContact[]>(INITIAL_CONTACTS);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  
  const [inputText, setInputText] = useState('');
  
  // State tìm kiếm trong chat
  const [searchContactTerm, setSearchContactTerm] = useState('');

  // State cho Modal tạo nhóm
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // Ref
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null); // Ref để bắt click outside
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref cho input file

  const activeContact = contacts.find(c => c.id === activeContactId);
  const currentMessages = activeContactId ? (messages[activeContactId] || []) : [];

  // Lọc danh sách liên hệ dựa trên từ khóa tìm kiếm
  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchContactTerm.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, isOpen, activeContactId]);

  // Xử lý Click Outside để đóng chatbox
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen && 
        widgetRef.current && 
        !widgetRef.current.contains(event.target as Node) &&
        !showCreateGroupModal // Không đóng nếu đang mở modal tạo nhóm
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, showCreateGroupModal]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeContactId) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: CURRENT_USER.name,
      text: inputText,
      timestamp: new Date(),
      isMe: true
    };

    setMessages(prev => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMessage]
    }));
    setInputText('');

    // Không còn Logic AI tự động trả lời
    // Chỉ đơn thuần lưu tin nhắn vào state (giả lập chat nội bộ)
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeContactId) {
      const file = e.target.files[0];
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: 'me',
        senderName: CURRENT_USER.name,
        text: `📎 Đã gửi file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
        timestamp: new Date(),
        isMe: true
      };

      setMessages(prev => ({
        ...prev,
        [activeContactId]: [...(prev[activeContactId] || []), newMessage]
      }));
      
      // Reset input file
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Logic Tạo Nhóm
  const toggleMemberSelection = (id: string) => {
    if (selectedMemberIds.includes(id)) {
      setSelectedMemberIds(selectedMemberIds.filter(mid => mid !== id));
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim() || selectedMemberIds.length === 0) return;

    const newGroupId = `group_${Date.now()}`;
    const newGroup: ChatContact = {
      id: newGroupId,
      name: newGroupName,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newGroupName)}&background=random&color=fff`,
      type: 'group',
      isOnline: true,
      members: [...selectedMemberIds, 'me'],
      role: `${selectedMemberIds.length + 1} thành viên`
    };

    setContacts([newGroup, ...contacts]);
    setMessages(prev => ({ ...prev, [newGroupId]: [] }));
    
    setShowCreateGroupModal(false);
    setNewGroupName('');
    setSelectedMemberIds([]);
    setActiveContactId(newGroupId);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
      >
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div ref={widgetRef} className="fixed bottom-4 right-4 w-[900px] h-[600px] bg-white rounded-xl shadow-2xl flex border border-gray-200 overflow-hidden z-50 font-sans">
      
      {/* 1. Sidebar List */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        {/* Sidebar Header */}
        <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-700">Nội bộ</h3>
            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full font-bold">{contacts.length}</span>
          </div>
          <div className="flex gap-1">
             {CURRENT_USER.isAdmin && (
                <button 
                  onClick={() => setShowCreateGroupModal(true)}
                  title="Tạo nhóm chat mới"
                  className="p-2 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
                >
                  <UserPlus size={18} />
                </button>
             )}
             <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-600">
               <Minus size={18} />
            </button>
          </div>
        </div>

        {/* Search Input for Chat */}
        <div className="p-3">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="Tìm nhân viên, nhóm..." 
                className="w-full bg-gray-100 pl-9 pr-3 py-1.5 rounded-full text-sm outline-none focus:ring-1 focus:ring-orange-300"
                value={searchContactTerm}
                onChange={(e) => setSearchContactTerm(e.target.value)}
              />
           </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredContacts.length === 0 ? (
             <div className="text-center text-gray-400 text-sm mt-4">Không tìm thấy kết quả</div>
          ) : (
            filteredContacts.map(contact => (
              <div 
                key={contact.id}
                onClick={() => setActiveContactId(contact.id)}
                className={`p-3 mx-2 rounded-lg flex items-center gap-3 cursor-pointer transition-colors mb-1 ${activeContactId === contact.id ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
              >
                <div className="relative flex-shrink-0">
                  <img src={contact.avatar} alt={contact.name} className="w-11 h-11 rounded-full object-cover border border-gray-100" />
                  {contact.type === 'user' && contact.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                  {contact.type === 'group' && (
                     <div className="absolute -bottom-1 -right-1 bg-gray-100 rounded-full p-0.5 border border-white">
                        <Users size={12} className="text-gray-600"/>
                     </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                     <div className="font-medium text-sm text-gray-800 truncate max-w-[140px]">{contact.name}</div>
                     <div className="text-[10px] text-gray-400">12:30</div>
                  </div>
                  <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                     {contact.type === 'group' && <span className="text-gray-400">Bạn: </span>}
                     {contact.role}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Chat Area */}
      <div className="flex-1 flex flex-col bg-[#f5f6f7]">
        {activeContactId ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-5 bg-white shadow-sm z-10">
               <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={activeContact?.avatar} className="w-10 h-10 rounded-full border border-gray-100" />
                    {activeContact?.type === 'user' && activeContact?.isOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 flex items-center gap-2">
                       {activeContact?.name}
                       {activeContact?.type === 'group' && <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 rounded border border-gray-200">Nhóm</span>}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                       {activeContact?.type === 'user' ? (activeContact?.isOnline ? 'Vừa truy cập' : 'Ngoại tuyến') : `${activeContact?.members?.length || 0} thành viên`}
                       {activeContact?.type === 'user' && <span className="w-1 h-1 rounded-full bg-gray-300"></span>}
                       {activeContact?.role}
                    </div>
                  </div>
               </div>
               <div className="flex items-center gap-3 text-gray-400">
                  <Search size={20} className="cursor-pointer hover:text-gray-600"/>
                  <MoreVertical size={20} className="cursor-pointer hover:text-gray-600"/>
               </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {currentMessages.map((msg, index) => {
                 const showAvatar = !msg.isMe && (index === 0 || currentMessages[index - 1].senderId !== msg.senderId);
                 const isFile = msg.text.startsWith('📎');
                 return (
                  <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                     {!msg.isMe && activeContact?.type === 'group' && showAvatar && (
                        <span className="text-[10px] text-gray-500 ml-10 mb-0.5">{msg.senderName}</span>
                     )}
                     <div className={`flex items-end gap-2 max-w-[80%] ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!msg.isMe && (
                           <div className="w-8 flex-shrink-0">
                              {showAvatar ? (
                                 <img src={activeContact?.type === 'user' ? activeContact.avatar : `https://ui-avatars.com/api/?name=${msg.senderName || 'U'}&background=random`} className="w-8 h-8 rounded-full shadow-sm" />
                              ) : <div className="w-8"></div>}
                           </div>
                        )}
                        
                        <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm leading-relaxed break-words relative group ${
                           msg.isMe 
                           ? 'bg-orange-100 text-gray-800 rounded-tr-none border border-orange-200' 
                           : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                        }`}>
                           {isFile ? (
                             <div className="flex items-center gap-2 italic text-blue-600">
                               <FileText size={16}/> {msg.text.replace('📎 ', '')}
                             </div>
                           ) : msg.text}
                           
                           <div className="text-[9px] opacity-50 text-right mt-1 font-medium">
                              {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           </div>
                        </div>
                     </div>
                  </div>
                 );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
               <div className="flex items-center gap-3 bg-white">
                  {/* Hidden File Input */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload}
                  />
                  <button 
                    type="button" 
                    onClick={triggerFileUpload}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Đính kèm file"
                  >
                     <Paperclip size={22} />
                  </button>
                  <div className="flex-1 relative">
                     <input 
                     type="text" 
                     value={inputText}
                     onChange={(e) => setInputText(e.target.value)}
                     placeholder={`Nhập tin nhắn tới ${activeContact?.name}...`} 
                     className="w-full bg-gray-100 text-gray-800 text-sm rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:ring-1 focus:ring-orange-300 focus:bg-white transition-all border border-transparent focus:border-orange-200"
                     />
                     <button 
                     type="submit" 
                     disabled={!inputText.trim()}
                     className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all ${inputText.trim() ? 'text-orange-600 hover:bg-orange-50' : 'text-gray-300'}`}
                     >
                     <Send size={20} className={inputText.trim() ? "fill-orange-600" : ""} />
                     </button>
                  </div>
               </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300 bg-[#f5f6f7]">
             <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare size={64} className="text-gray-300"/>
             </div>
             <p className="font-medium text-gray-500">Trao đổi nội bộ CoffeeHR</p>
             <p className="text-sm mt-1">Chọn đồng nghiệp để bắt đầu trò chuyện</p>
          </div>
        )}
      </div>

      {/* 3. MODAL TẠO NHÓM */}
      {showCreateGroupModal && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white rounded-lg shadow-xl w-full max-w-sm flex flex-col max-h-[90%] overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                 <h3 className="font-bold text-gray-800">Tạo nhóm mới</h3>
                 <button onClick={() => setShowCreateGroupModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={20}/>
                 </button>
              </div>
              
              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                 <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Tên nhóm</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="VD: Nhóm dự án A..."
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                 </div>
                 
                 <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2 uppercase">Thêm thành viên</label>
                    <div className="space-y-1">
                       {/* Lọc ra các user thường (không phải AI, không phải nhóm) để chọn */}
                       {contacts.filter(c => c.type === 'user' && !c.isAi).map(user => (
                          <div 
                            key={user.id} 
                            onClick={() => toggleMemberSelection(user.id)}
                            className={`flex items-center gap-3 p-2 rounded cursor-pointer border ${selectedMemberIds.includes(user.id) ? 'bg-orange-50 border-orange-200' : 'border-transparent hover:bg-gray-50'}`}
                          >
                             <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedMemberIds.includes(user.id) ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'}`}>
                                {selectedMemberIds.includes(user.id) && <CheckCircle size={14} className="text-white"/>}
                             </div>
                             <img src={user.avatar} className="w-8 h-8 rounded-full"/>
                             <div className="text-sm font-medium text-gray-700">{user.name}</div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                 <button onClick={() => setShowCreateGroupModal(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded">Hủy</button>
                 <button 
                  onClick={handleCreateGroup}
                  disabled={!newGroupName.trim() || selectedMemberIds.length === 0}
                  className={`px-4 py-1.5 text-sm text-white rounded shadow-sm transition-all ${(!newGroupName.trim() || selectedMemberIds.length === 0) ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}
                 >
                    Tạo nhóm
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;